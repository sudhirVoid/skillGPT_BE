import { GPT_API_KEY } from "../constants/constants";
import OpenAI from "openai";
import { marked } from 'marked';
const openai = new OpenAI(
    {
        apiKey: GPT_API_KEY
    }
);

interface SyllabusConfig {
    bookTopic: String,
    language: String
}

interface ChapterConfig {
    bookTopic: String,
    bookChapter: String,
    bookLanguage: String
}
async function syllabusGenerator(syllabusConfig: SyllabusConfig) {
    let syllabusSystemPrompt = `
    You are really a good syllabus designer. Generate me topics for the book on "${syllabusConfig.bookTopic}" in "${syllabusConfig.language}" language. The topics generated should be separated by | in a single line.
    For Example:
    Topic 1 | Topic 2 | Topic 3. You will only generate topic no other text. Donot use numeric listing.
`
    let messageObject = [{ role: "system", content: syllabusSystemPrompt }]
    let syllabus = await gptCall(messageObject)
    console.log(syllabus)
    let chapters = syllabus!.message!.content!.split('|').map(chapter => chapter.trimStart().trimEnd())
    return chapters;
}

async function chapterGenerator(chapterConfig: ChapterConfig){
    let chapterPrompt = `
    I am writing a book about ${chapterConfig.bookTopic}.\n\nI need a single chapter to be explained, which is: ${chapterConfig.bookChapter}.\n\nWrite this chapter for me. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The chapter must be written in ${chapterConfig.bookLanguage}.\n\nThe chapter must have the following format:\n\n# ${chapterConfig.bookChapter}\n\ncontent...\n\nHere is the chapter written in ${chapterConfig.bookLanguage}:
    `

    let messageObject = [{ role: "system", content: chapterPrompt }]
    let syllabus = await gptCall(messageObject)
    console.log(syllabus)
    //this is markdown string.
    const chapterContent = syllabus!.message!.content as string
    const htmlContent = marked.parse(chapterContent);
    return htmlContent;
    
}




async function gptCall(messageObject: any) {
    
    const completion = await openai.chat.completions.create({
        messages: messageObject,
        model: "gpt-3.5-turbo",
      });
      console.log(completion.choices[0]);
      return completion.choices[0]
}

export {syllabusGenerator, chapterGenerator, SyllabusConfig, ChapterConfig}