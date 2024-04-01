import { Router, Request, Response } from "express";
import {
  syllabusGenerator,
  SyllabusConfig,
  ChapterConfig,
  chapterGenerator,
} from "../controllers/gptController";
import { getPgVersion  } from "../controllers/db";

const router: Router = Router();

router.post("/syllabus", async (req: Request, res: Response) => {
//   let syllabus: SyllabusConfig = req.body;
//   let syllabusTopics = await syllabusGenerator(syllabus);
//   res.json({ chapters: syllabusTopics, topic: syllabus.bookTopic });
    let bookTopic = "Space";
    let chapters = [
      "Exploración espacial",
      "Los planetas del sistema solar",
      "Agujeros negros y agujeros de gusano",
      "Historia de la astronomía",
      "Vida en el espacio",
      "Tecnología espacial",
      "El origen del universo",
      "Viajes interestelares",
      "Misterios del cosmos.",
    ];
    //insert bookTopic
    await getPgVersion();
    //insert chapters
    // await chapterInsertion(1, chapters);
  res.json({
    chapters: [
      "Exploración espacial",
      "Los planetas del sistema solar",
      "Agujeros negros y agujeros de gusano",
      "Historia de la astronomía",
      "Vida en el espacio",
      "Tecnología espacial",
      "El origen del universo",
      "Viajes interestelares",
      "Misterios del cosmos.",
    ],
    topic: "Space",
  });
});

router.post("/chapter", async (req: Request, res: Response) => {
  let chapter: ChapterConfig = req.body;
  let chapterContent = await chapterGenerator(chapter);
  res.setHeader("Content-Type", "text/html");
  // res.json({msg: chapterContent})
  res.send(chapterContent);
});

export default router;
