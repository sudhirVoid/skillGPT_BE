import { GPT_API_KEY } from "../constants/constants";
import OpenAI from "openai";
import { marked } from "marked";
import { Transform } from "stream";
const openai = new OpenAI({
  apiKey: GPT_API_KEY,
});

interface SyllabusConfig {
  bookTopic: string;
  language: string;
  userId: string;
}

interface ChapterConfig {
  bookTopic: string;
  bookChapter: string;
  bookLanguage: string;
  chapterId: number;
}
interface ChapterConversationConfig {
  chapterDetails: ChapterConfig;
  content: {
    gpt: string;
    user?: string;
  }[];
}
async function syllabusGenerator(syllabusConfig: SyllabusConfig) {
  let syllabusSystemPrompt = `
    You are really a good syllabus designer. Generate me topics for the book on "${syllabusConfig.bookTopic}" in "${syllabusConfig.language}" language. The topics generated should be separated by | in a single line.
    For Example:
    Topic 1 | Topic 2 | Topic 3. You will only generate topic no other text. Donot use numeric listing.
`;
  let messageObject = [{ role: "system", content: syllabusSystemPrompt }];
  let syllabus = await gptCall(messageObject);
  let chapters = syllabus!
    .message!.content!.split("|")
    .map((chapter) => chapter.trimStart().trimEnd());
  return chapters;
}
function makePromptForChapterAndConversation({
  bookTopic,
  bookChapter,
  bookLanguage,
}: {
  bookTopic: string;
  bookChapter: string;
  bookLanguage: string;
}) {
  return `
    I am writing a book about ${bookTopic}.\n\nI need a single chapter to be explained, which is: ${bookChapter}.\n\nWrite this chapter for me. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The chapter must be written in ${bookLanguage}.\n\nThe chapter must have the following format:\n\n# ${bookChapter}\n\ncontent...\n\nHere is the chapter written in ${bookLanguage}:
    `;
}
async function chapterGenerator(chapterConfig: ChapterConfig) {
  let chapterPrompt = makePromptForChapterAndConversation({
    bookTopic: chapterConfig.bookTopic,
    bookChapter: chapterConfig.bookChapter,
    bookLanguage: chapterConfig.bookLanguage,
  });
  // `
  // I am writing a book about ${chapterConfig.bookTopic}.\n\nI need a single chapter to be explained, which is: ${chapterConfig.bookChapter}.\n\nWrite this chapter for me. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The chapter must be written in ${chapterConfig.bookLanguage}.\n\nThe chapter must have the following format:\n\n# ${chapterConfig.bookChapter}\n\ncontent...\n\nHere is the chapter written in ${chapterConfig.bookLanguage}:
  // `

  let messageObject = [{ role: "system", content: chapterPrompt }];
  let syllabus = await gptCall(messageObject);
  //this is markdown string.
  const chapterContent = syllabus!.message!.content as string;
  const htmlContent = marked.parse(chapterContent);
  return htmlContent;
}
async function chapterConversationHandler(
  conversationObject: ChapterConversationConfig
) {
  // let conversationPrompt = makePromptForChapterAndConversation({bookTopic: conversationObject.chapterDetails.bookTopic, bookChapter: conversationObject.chapterDetails.bookChapter,bookLanguage: conversationObject.chapterDetails.bookLanguage});

  let conversationPrompt = `
    I am writing a book about ${conversationObject.chapterDetails.bookTopic}.\n\nI write chapter, which is: ${conversationObject.chapterDetails.bookChapter}.\n\nUser is trying to ask something he is not getting so answer user query for this chapter.
    Please donot write the chapter name in headings . You will generate the sentences without any heading tags like h1, h2, etc. Also include some examples if possible.\n\nDo not add any comment before your answer and just give the content. \n\nHere are the instructions:\n- Use Markdown and LateX to enhance the formatting of your answer.\n- Markdown and LateX should be nicely formatted, coherent, without formatting mistakes.\n- Do not add any images and headings or links in your answer.\n- When you code with markdown blocks, be sure to use the Prism language name for a proper formatting (e.g. javascript, python, objectivec, etc.).\n- LateX code (inline and block) should be enclosed in double dollar signs (e.g. $$x^2$$).\n- The answer should be written in ${conversationObject.chapterDetails.bookLanguage}.
    `;

  let messageObject = [{ role: "system", content: conversationPrompt }];

  //lets add other conversation to the messageObject .
  conversationObject.content.forEach((conversation) => {
    messageObject.push({ role: "assistant", content: conversation.gpt });

    //check for the user:
    if (Object.hasOwnProperty.call(conversation, "user")) {
      messageObject.push({
        role: "user",
        content: conversation.user as string,
      });
    }
  });
  let currentUser = messageObject[0].content;

  let result = await gptCall(messageObject);
  //lets get the gpt response
  let gptResponse = marked.parse(result!.message!.content as string);
  let conversationObj = {
    gpt: gptResponse,
  };
  return conversationObj;
}
const generateFlashCards = async (topic: string, count: number = 10) => {
  try {
    const flashCardPrompt = `Generate ${count} questions and an answer for each, return as a list of json with the fields "question" and "answer". The questions are about ${topic}.`;
    const messageObject = [{ role: "system", content: flashCardPrompt }];
    const result = await gptCall(messageObject, true);
    const content = result.message.content;

    if (content) {
      const flashCards = JSON.parse(content);
      return flashCards.questions.map(
        (card: { question: string; answer: string }) => ({
          question: card.question,
          answer: card.answer,
        })
      );
    }

    return null;
  } catch (error) {
    console.error("Error generating flash cards:", error);
    return null;
  }
};

const generateQuiz = async (topic: string, count: number = 10) => {
  try {
    const quizPrompt = `
        You are an expert educational content creator specializing in generating high-quality multiple-choice questions (MCQs) from provided text passages.

Input Requirements:
- I will provide you with paragraphs of text on a specific topic on delimiter <paragraphForMCQ>
- You will generate MCQs based on those paragraphs
- The number of MCQs will be specified by me on delimiter <noOfQuestionsToGenerate>

MCQ Generation Guidelines:
1. Each MCQ should:
   - Be directly derived from the content in the paragraphs
   - Test comprehension, not just recall
   - Have one correct answer and three plausible but incorrect alternatives
   - Avoid trick questions or overly complex language

2. MCQ Format: Generate a JSON with the following structure:
json
{
  "mcqs": [
    {
      "question": "<question_text>",
      "options": [
        {"text": "<option_1>", "is_correct": false},
        {"text": "<option_2>", "is_correct": false},
        {"text": "<option_3>", "is_correct": false},
        {"text": "<option_4>", "is_correct": true}
      ],
      "explanation": "<brief_explanation_of_correct_answer>"
    }
    // More MCQ objects...
  ]
}
<paragraphForMCQ>${topic}</paragraphForMCQ>
<noOfQuestionsToGenerate> ${count}</noOfQuestionsToGenerate>  
`;
const messageObject = [{ role: "system", content: quizPrompt }];
    const result = await gptCall(messageObject, true);
    const content = result.message.content;

    if (content) {
      const quizSheet = JSON.parse(content);
      return quizSheet.mcqs;
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
};

async function gptCall(messageObject: any, isStructuredCall = false) {
  if (isStructuredCall) {
    const completion = await openai.chat.completions.create({
      messages: messageObject,
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    });
    return completion.choices[0];
  } else {
    const completion = await openai.chat.completions.create({
      messages: messageObject,
      model: "gpt-4o-mini",
    });
    return completion.choices[0];
  }
}

export {
  syllabusGenerator,
  chapterGenerator,
  SyllabusConfig,
  ChapterConfig,
  generateFlashCards,
  ChapterConversationConfig,
  chapterConversationHandler,
  generateQuiz
};
