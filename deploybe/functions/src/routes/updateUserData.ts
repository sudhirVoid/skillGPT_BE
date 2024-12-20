import { Router, Request, Response } from "express";
import { updateChapterCompletionStatus, updateQuizResult } from "../controllers/db";
import { QuizPaper } from "../models/interfaces";

const router = Router();

router.post("/isChapterCompleted", async(req: Request, res: Response) => {
    let chapterId = req.body.chapterid;
    let isCompleted = req.body.isChapterCompleted;
    let response = await updateChapterCompletionStatus(chapterId, isCompleted)
    res.json(
        {
            data:response,
            msg:'Updated Successfully'
        }
    );
  });

  router.post('/quiz', async(req: Request, res: Response) => {
    let requestPayload = req.body;
    let bookId = requestPayload.bookId;
    let userId = requestPayload.userId;
    let quizPaper:QuizPaper = requestPayload.quizPaper;
    let quizId = quizPaper.quizId;
    await updateQuizResult(bookId, userId, quizId, quizPaper);
    res.status(200).json({
      msg:'Updated Successfully'
    })
  });


export {router as updateUserDataRouter}