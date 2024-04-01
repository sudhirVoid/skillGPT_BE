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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chapterGenerator = exports.syllabusGenerator = void 0;
const constants_1 = require("../constants/constants");
const openai_1 = __importDefault(require("openai"));
const marked_1 = require("marked");
const openai = new openai_1.default({
    apiKey: constants_1.GPT_API_KEY
});
function syllabusGenerator(syllabusConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let syllabusSystemPrompt = `
    You are really a good syllabus designer. Generate me topics for the book on "${syllabusConfig.bookTopic}" in "${syllabusConfig.language}" language. The topics generated should be separated by | in a single line.
    For Example:
    Topic 1 | Topic 2 | Topic 3. You will only generate topic no other text. Donot use numeric listing.
`;
        let messageObject = [{ role: "system", content: syllabusSystemPrompt }];
        let syllabus = yield gptCall(messageObject);
        console.log(syllabus);
        let chapters = syllabus.message.content.split('|').map(chapter => chapter.trimStart().trimEnd());
        return chapters;
    });
}
exports.syllabusGenerator = syllabusGenerator;
function chapterGenerator(chapterConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let chapterPrompt = `
    I am writing a book about ${chapterConfig.bookTopic}.\n\nI need a single chapter to be explained, which is: ${chapterConfig.bookChapter}.\n\nWrite this chapter for me. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The chapter must be written in ${chapterConfig.bookLanguage}.\n\nThe chapter must have the following format:\n\n# ${chapterConfig.bookChapter}\n\ncontent...\n\nHere is the chapter written in ${chapterConfig.bookLanguage}:
    `;
        let messageObject = [{ role: "system", content: chapterPrompt }];
        let syllabus = yield gptCall(messageObject);
        console.log(syllabus);
        //this is markdown string.
        const chapterContent = syllabus.message.content;
        const htmlContent = marked_1.marked.parse(chapterContent);
        return htmlContent;
    });
}
exports.chapterGenerator = chapterGenerator;
function chapterConversationHandler(conversationObject) {
    return __awaiter(this, void 0, void 0, function* () {
        let conversationPrompt = `
    
    `;
        return yield gptCall(conversationObject);
    });
}
function gptCall(messageObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.chat.completions.create({
            messages: messageObject,
            model: "gpt-3.5-turbo",
        });
        console.log(completion.choices[0]);
        return completion.choices[0];
    });
}
