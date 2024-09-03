import { GPT_API_KEY } from "../constants/constants";
import OpenAI from "openai";
import { marked } from 'marked';

const openai = new OpenAI(
    {
        apiKey: GPT_API_KEY
    }
);

interface SyllabusConfig {
    bookTopic: string,
    language: string,
    userId: string
}

interface ChapterConfig {
    bookTopic: string,
    bookChapter: string,
    bookLanguage: string,
    chapterId:number
}
interface ChapterConversationConfig{
    chapterDetails: ChapterConfig
    content: {
        gpt: string,
        user?: string
    }[]
}
async function syllabusGenerator(syllabusConfig: SyllabusConfig) {
    let syllabusSystemPrompt = `
    You are really a good syllabus designer. Generate me topics for the book on "${syllabusConfig.bookTopic}" in "${syllabusConfig.language}" language. The topics generated should be separated by | in a single line.
    For Example:
    Topic 1 | Topic 2 | Topic 3. You will only generate topic no other text. Donot use numeric listing.
`
    let messageObject = [{ role: "system", content: syllabusSystemPrompt }]
    let syllabus = await gptCall(messageObject)
    let chapters = syllabus!.message!.content!.split('|').map(chapter => chapter.trimStart().trimEnd())
    return chapters;
}
function makePromptForChapterAndConversation({bookTopic, bookChapter,bookLanguage}: {bookTopic: string, bookChapter: string, bookLanguage: string}){
    return `
    I am writing a book about ${bookTopic}.\n\nI need a single chapter to be explained, which is: ${bookChapter}.\n\nWrite this chapter for me. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The chapter must be written in ${bookLanguage}.\n\nThe chapter must have the following format:\n\n# ${bookChapter}\n\ncontent...\n\nHere is the chapter written in ${bookLanguage}:
    `
}
async function chapterGenerator(chapterConfig: ChapterConfig){
    let chapterPrompt = makePromptForChapterAndConversation({bookTopic: chapterConfig.bookTopic, bookChapter: chapterConfig.bookChapter,bookLanguage: chapterConfig.bookLanguage})
    // `
    // I am writing a book about ${chapterConfig.bookTopic}.\n\nI need a single chapter to be explained, which is: ${chapterConfig.bookChapter}.\n\nWrite this chapter for me. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The chapter must be written in ${chapterConfig.bookLanguage}.\n\nThe chapter must have the following format:\n\n# ${chapterConfig.bookChapter}\n\ncontent...\n\nHere is the chapter written in ${chapterConfig.bookLanguage}:
    // `

    let messageObject = [{ role: "system", content: chapterPrompt }]
    let syllabus = await gptCall(messageObject)
    //this is markdown string.
    const chapterContent = syllabus!.message!.content as string
    const htmlContent = marked.parse(chapterContent);
    return htmlContent;
    
}

async function chapterConversationHandler(conversationObject: ChapterConversationConfig){
    // let conversationPrompt = makePromptForChapterAndConversation({bookTopic: conversationObject.chapterDetails.bookTopic, bookChapter: conversationObject.chapterDetails.bookChapter,bookLanguage: conversationObject.chapterDetails.bookLanguage});

    let conversationPrompt = 
`
    I am writing a book about ${conversationObject.chapterDetails.bookTopic}.\n\nI write chapter, which is: ${conversationObject.chapterDetails.bookChapter}.\n\nUser is trying to ask something he is not getting so answer user query for this chapter.
    Please donot write the chapter name in headings . You will generate the sentences without any heading tags like h1, h2, etc. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images and headings or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The answer should be written in ${conversationObject.chapterDetails.bookLanguage}.
    `
    

    let messageObject = [{ role: "system", content: conversationPrompt }];

    //lets add other conversation to the messageObject .
    conversationObject.content.forEach((conversation) => {
        
        messageObject.push({ role: "assistant", content: conversation.gpt })

        //check for the user:
        if(Object.hasOwnProperty.call(conversation, "user")){
            messageObject.push({ role: "user", content: conversation.user as string })
        }
    })
    let currentUser = messageObject[0].content
    
    let result =  await gptCall(messageObject)
    //lets get the gpt response
    let gptResponse = marked.parse( result!.message!.content as string)
    let conversationObj = {
        gpt: gptResponse,
        
    }
    return conversationObj;
}

async function gptCall(messageObject: any) {
    const completion = await openai.chat.completions.create({
        messages: messageObject,
        model: "gpt-4o-mini",
      });
      return completion.choices[0]
}

export {syllabusGenerator, chapterGenerator, SyllabusConfig, ChapterConfig, ChapterConversationConfig, chapterConversationHandler}