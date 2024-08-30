import { Router, Request, Response } from "express";
import { updateChapterCompletionStatus } from "../controllers/db";

const router = Router();

router.post("/isChapterCompleted", async(req: Request, res: Response) => {
    let chapterId = req.body.chapterid;
    let isCompleted = req.body.isChapterCompleted;
    let response = await updateChapterCompletionStatus(chapterId, isCompleted)
    console.log(response)
    res.json(
        {
            data:response,
            msg:'Updated Successfully'
        }
    );
  });



export {router as updateUserDataRouter}