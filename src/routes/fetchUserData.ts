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
import { getOldBookDataQuery } from "../utils/getQueries";
import { Question, QuizPaper } from "../models/interfaces";

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
    let query = getOldBookDataQuery(req.body.userId, req.body.bookId);
    let allBooks = await getBookChaptersByBookId(query);
    res.json({
      userData: allBooks
    })
  })

export default router;
