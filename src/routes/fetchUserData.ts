import { Router, Request, Response } from "express";
import {
  syllabusGenerator,
  SyllabusConfig,
  ChapterConfig,
  chapterGenerator,
  ChapterConversationConfig,
  chapterConversationHandler
} from "../controllers/gptController";
import {  getAllBooksOfUser, getBookChaptersByBookId, getChapterConversationByChapterId  } from "../controllers/db";

const router: Router = Router();

router.post("/getAllBooks", async(req: Request, res: Response) => {
    let userId = req.body.userId;
    let allBooks = await getAllBooksOfUser(userId)
    res.json(
        {
            userData: allBooks
        }
    );
  });

  router.post("/getBookChapters", async(req: Request, res: Response) => {
    let query = `SELECT * FROM CHAPTERS WHERE book_id = ${req.body.bookId};`
    let allChapters = await getBookChaptersByBookId(query);
    res.json({
      userData: allChapters
    })
  });

  router.post("/getChapterContent", async(req: Request, res: Response) => {
    let chapterId = req.body.chapterId;
    let chapterContent = await getChapterConversationByChapterId(chapterId);
    res.json({
      userData: chapterContent
    })
  })

  router.post('/getOldBookData', async(req: Request, res: Response) => {
    let query = `SELECT
                  B.book_id AS bookId,
                  B.title AS bookTitle,
                  B.booklanguage AS bookLanguage,
                  B.user_id AS userId,
                  C.chapter_id AS chapterId,
                  C.chapter_title AS chapterTitle,
                  C.is_completed AS isChapterCompleted,
                  Co.content_id AS contentId,
                  Co.content_text AS contentText
                 FROM Books B
                  INNER JOIN Chapters C
                  ON B.book_id = C.book_id
                  LEFT JOIN Content Co
                  ON C.chapter_id = Co.chapter_id
                  WHERE B.user_id = '${req.body.userId}'
                    AND B.book_id = ${req.body.bookId};`
    let allBooks = await getBookChaptersByBookId(query);
    res.json({
      userData: allBooks
    })
  })

export default router;
