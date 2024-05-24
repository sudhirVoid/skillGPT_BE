import { Router, Request, Response } from "express";
import {
  syllabusGenerator,
  SyllabusConfig,
  ChapterConfig,
  chapterGenerator,
  ChapterConversationConfig,
  chapterConversationHandler
} from "../controllers/gptController";
import {  getAllBooksOfUser  } from "../controllers/db";

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
    let bookId = req.body.bookId;
  });

export default router;
