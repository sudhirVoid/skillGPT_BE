import { Router, Request, Response } from "express";
import {
  syllabusGenerator,
  SyllabusConfig,
  ChapterConfig,
  chapterGenerator,
  ChapterConversationConfig,
  chapterConversationHandler,
  checkIfTopicIsEthical
} from "../controllers/gptController";
import { bookInsertion,chapterInsertion,ChapterConversation, chapterContentInsertion, chapterContentUpdate, getChapterConversationByChapterId  } from "../controllers/db";

const router: Router = Router();

router.post("/syllabus", async (req: Request, res: Response) => {
  let syllabus: SyllabusConfig = req.body;
  let chapters = await syllabusGenerator(syllabus);
//   res.json({ chapters: syllabusTopics, topic: syllabus.bookTopic });



    //insert bookTopic
    /*
    return object like:
    { book_id: 1, title: 'Physics' }

    */
    let bookResult = await bookInsertion(syllabus.bookTopic, syllabus.language, syllabus.userId);
    console.log(bookResult)
    let bookId = bookResult?.book_id;
    //insert chapters and returns chapter with their id at insertion time.
    /*
    [
    { chapterid: 10, chaptertitle: 'Exploración espacial' },
    { chapterid: 11, chaptertitle: 'Los planetas del sistema solar' }]

    */
    let chapterResult = await chapterInsertion(bookId, chapters);
    //TODO: 
  res.json({
    chaptersData: chapterResult,
    topicData: bookResult,
    
  });

  // res.json(
  //   {
  //     chapterData: [
  //       { chapterid: 10, chaptertitle: 'Exploración espacial' },
  //       { chapterid: 11, chaptertitle: 'Los planetas del sistema solar' }],
  //       topicData: { book_id: 1, title: 'Physics' }
  //   }
  // )
});

//TODO: need to check in db if that chapter already exists or not . if doesnot exist then only generate with chatgpt.
router.post("/chapter", async (req: Request, res: Response) => {
  let chapter: ChapterConfig = req.body;
  //here chapterContent is pure html.
  // check if the chapterid already exists in the content table.
  let chapterData = await getChapterConversationByChapterId(chapter.chapterId);
  if(chapterData.length > 0){
    res.json({msg: chapterData});
  }
  else{
  let chapterContent = await chapterGenerator(chapter);
  let chapterConversation: ChapterConversation = {
    chapterId: chapter.chapterId,
    content: [{
      gpt: chapterContent
    }]
  }
  let chapterContentResult = await chapterContentInsertion(chapterConversation)
  res.json({msg: chapterContentResult});
}
  // res.setHeader("Content-Type", "text/html");
});

router.post("/chapterConversation", async (req: Request, res: Response) => {
  /*
  content: {
        gpt: string,
        user?: string
    }[]
    here we change [{role: 'agent', content: 'hello'}] we have system, agent, user.
    gpt-agent
    user-user 
  */
  let chapterConversation: ChapterConversationConfig = req.body;

  // send this to chapterConversationHandler
  let conversationResult = await chapterConversationHandler(chapterConversation)
  /*
    response structure is this:
    {
        gpt: gptResponse,
        user: currentUser
    }

  */
    chapterConversation.content.push(conversationResult as any)
    console.log(chapterConversation.content)
    //insert in database.
    let updateConversationObject: ChapterConversation = {
      chapterId: chapterConversation.chapterDetails.chapterId,
      content: chapterConversation.content
    }
    await chapterContentUpdate(updateConversationObject)
  res.json({msg: conversationResult});
});

router.post("/isEthicalTopic", async (req: Request, res: Response) => {
  let topic = req.body.topic
  let isEthical = await checkIfTopicIsEthical(topic);
    res.json({msg: isEthical});
});


export default router;
