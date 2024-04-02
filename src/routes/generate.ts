import { Router, Request, Response } from "express";
import {
  syllabusGenerator,
  SyllabusConfig,
  ChapterConfig,
  chapterGenerator,
} from "../controllers/gptController";
import { bookInsertion, getPgVersion,chapterInsertion,ChapterConversation, chapterContentInsertion  } from "../controllers/db";

const router: Router = Router();

router.post("/syllabus", async (req: Request, res: Response) => {
  let syllabus: SyllabusConfig = req.body;
  let chapters = await syllabusGenerator(syllabus);
//   res.json({ chapters: syllabusTopics, topic: syllabus.bookTopic });
let bookTopic = syllabus.bookTopic;
let bookLanguage = syllabus.language
// let chapters = [
//   "Introduction to Medical Science",
//   "Anatomy and Physiology",
//   "Disease Pathology",
//   "Pharmacology and Therapeutics",
//   "Medical Imaging Techniques",
//   "Surgical Procedures",
//   "Epidemiology and Public Health",
//   "Genetics and Molecular Medicine",
//   "Emerging Technologies in Healthcare"
// ];


    //insert bookTopic
    /*
    return object like:
    { book_id: 1, title: 'Physics' }

    */
    let bookResult = await bookInsertion(bookTopic, bookLanguage);
    console.log(bookResult)
    let bookId = bookResult?.book_id;
    //insert chapters and returns chapter with their id at insertion time.
    /*
    [
    { chapterid: 10, chaptertitle: 'Exploración espacial' },
    { chapterid: 11, chaptertitle: 'Los planetas del sistema solar' },]

    */
    let chapterResult = await chapterInsertion(bookId, chapters);
    
  res.json({
    chaptersData: chapterResult,
    topicData: bookResult,
  });
});

router.post("/chapter", async (req: Request, res: Response) => {
  let chapter: ChapterConfig = req.body;
  //here chapterContent is pure html.
  let chapterContent = await chapterGenerator(chapter);
  let chapterConversation: ChapterConversation = {
    chapterId: chapter.chapterId,
    content: [{
      gpt: chapterContent
    }]
  }
  let chapterContentResult = await chapterContentInsertion(chapterConversation)
  // res.setHeader("Content-Type", "text/html");
  res.json({msg: chapterContentResult});

});

export default router;
