"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gptController_1 = require("../controllers/gptController");
const db_1 = require("../controllers/db");
const router = (0, express_1.Router)();
router.post("/syllabus", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield (0, db_1.bookInsertion)(bookTopic);
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
}));
router.post("/chapter", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let chapter = req.body;
    let chapterContent = yield (0, gptController_1.chapterGenerator)(chapter);
    res.setHeader("Content-Type", "text/html");
    // res.json({msg: chapterContent})
    res.send(chapterContent);
}));
exports.default = router;
