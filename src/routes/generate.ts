import  { Router, Request, Response} from "express";
import { syllabusGenerator, SyllabusConfig, ChapterConfig, chapterGenerator} from "../controllers/gptController";


const router: Router = Router()

router.post('/syllabus', async (req: Request, res: Response) => {
    let syllabus: SyllabusConfig = req.body
    let syllabusTopics = await syllabusGenerator(syllabus);
    res.json({msg: syllabusTopics})
})

router.post('/chapter', async (req: Request, res: Response) => {
    let chapter: ChapterConfig = req.body
    let chapterContent = await chapterGenerator(chapter);
    res.setHeader('Content-Type', 'text/html');
    // res.json({msg: chapterContent})
    res.send(chapterContent)
})



export default router;