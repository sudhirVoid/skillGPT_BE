import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import {
  PGUSER,
  PGHOST,
  PGDATABASE,
  PGPASSWORD,
  PGPORT,
  DATABASEURL,
} from "../constants/constants";
import { executeQuery } from "./queryExecutor";
import { queryStringOptimizer } from "../utils/queryStringOptimizer";
import { exec } from "child_process";
import { Question, QuizPaper } from "../models/interfaces";
interface ChapterConversation {
  chapterId: number;
  content: {
    gpt: string;
    user?: string; //user is optional
  }[];
}

// insert book title in table name BOOKS
async function bookInsertion(
  bookTitle: string,
  bookLanguage: string,
  userId: string
) {
  let query = `INSERT INTO BOOKS (title,booklanguage, user_id) VALUES ('${queryStringOptimizer(
    bookTitle
  )}','${bookLanguage}', '${userId}') RETURNING book_id , title, user_id;`;
  let result = await executeQuery(query);
  return result[0];
}

async function chapterInsertion(bookId: number, chapters: string[]) {
  let query = "INSERT INTO CHAPTERS (book_id, chapter_title) VALUES ";
  for (let i = 0; i < chapters.length; i++) {
    if (i === chapters.length - 1) {
      query += `(${bookId}, '${queryStringOptimizer(
        chapters[i]
      )}') RETURNING chapter_id as chapterId, chapter_title as chapterTitle;`;
      continue;
    }
    query += `(${bookId}, '${queryStringOptimizer(chapters[i])}'),`;
  }

  let result = await executeQuery(query);
  return result;
}

async function chapterContentInsertion(chapterDetails: ChapterConversation) {
  let query = `INSERT INTO CONTENT (chapter_id, content_text) VALUES (${
    chapterDetails.chapterId
  },'${queryStringOptimizer(
    JSON.stringify(chapterDetails.content)
  )}') RETURNING content_id, content_text ;`;

  let result = await executeQuery(query);
  return result;
}
async function chapterContentUpdate(chapterDetails: ChapterConversation) {
  let query = `UPDATE CONTENT
                SET content_text = '${queryStringOptimizer(
                  JSON.stringify(chapterDetails.content)
                )}'
                WHERE chapter_id = ${chapterDetails.chapterId}
                RETURNING content_id, content_text;
              `;
  let result = await executeQuery(query);
  return result;
}
async function getAllBooksOfUser(userId: string) {
  let query = `SELECT 
                b.*, 
                COALESCE(ROUND((SUM(CASE WHEN c.is_completed = 't' THEN 1 ELSE 0 END)::decimal / COUNT(c.chapter_id)) * 100, 2), 0) AS percentRead
                FROM 
                Books b
                LEFT JOIN 
                Chapters c ON b.book_id = c.book_id
                WHERE 
                b.user_id = '${userId}'
                GROUP BY 
                b.book_id;
    `;
  // let query = `SELECT * FROM BOOKS WHERE user_id = '${userId}';`;
  let result = await executeQuery(query);
  return result;
}

async function getBookChaptersByBookId(query: string) {
  let result = await executeQuery(query);
  return result;
}

async function getChapterDataByChapterId(chapterId: number) {
  let query = `SELECT * FROM CONTENT WHERE chapter_id = ${chapterId};`;
  let result = await executeQuery(query);
  return result;
}

async function getChapterConversationByChapterId(chapterId: number) {
  let query = `SELECT * FROM CONTENT WHERE chapter_id = ${chapterId};`;
  let result = await executeQuery(query);
  return result;
}

// set payments details(Neon)
async function setPayDetailsNeon(payDetails: any) {
  let query = `INSERT INTO PAYDETAILS (user_id, order_id, payment_id, paymentdate) VALUES ('${payDetails.user_id}','${payDetails.order_id}','${payDetails.payment_id}','${payDetails.paymentDate}');`;
  let result = await executeQuery(query);
  return result;
}

// set payments details Webhook(Neon)
async function setPayDetailsWebhookNeon(payDetailsWebhook: any) {
  let query = `INSERT INTO PAYDETAILSWEBHOOK (order_id, payment_data) VALUES ('${
    payDetailsWebhook.payload.payment.entity.order_id
  }','${JSON.stringify(payDetailsWebhook)}');`;
  let result = await executeQuery(query);
}

async function getBookByBookIdAndUserId(bookId: number, userId: string) {
  let query = `SELECT
                  B.book_id AS bookId,
                  B.title AS bookTitle,
                  B.booklanguage AS bookLanguage,
                  B.user_id AS userId,
                  C.chapter_id AS chapterId,
                  C.chapter_title AS chapterTitle,
                  Co.content_id AS contentId,
                  Co.content_text AS contentText
                 FROM Books B
                  INNER JOIN Chapters C
                  ON B.book_id = C.book_id
                  LEFT JOIN Content Co
                  ON C.chapter_id = Co.chapter_id
                  WHERE B.user_id = '${userId}'
                    AND B.book_id = ${bookId};`;
  let result = await executeQuery(query);
  return result;
}

async function updateChapterCompletionStatus(
  chapterId: number,
  isCompleted: boolean
) {
  let query = `UPDATE Chapters
                SET is_completed = '${isCompleted}'
                WHERE chapter_id = ${chapterId}
                RETURNING is_completed, chapter_id;
              `;
  let result = await executeQuery(query);
  return result;
}

async function saveFlashCardGenerated(bookId: number, flashCardContent: JSON) {
  // Escape the JSON content to make it safe for SQL
  const escapedContent = JSON.stringify(flashCardContent).replace(/'/g, "''");
  // Construct the query string
  const query = `INSERT INTO FLASHCARD (bookid, content)
                 VALUES (${bookId}, '${escapedContent}');`;
  // Execute the query
  const result = await executeQuery(query);
  return result;
}

async function saveNewQuestions(bookId: number, questions: Question[]) {
    try {
      let values = '';
      for (let i = 0; i < questions.length; i++) {
        const escapedContent = JSON.stringify(questions[i]).replace(/'/g, "''");
        values += `(${bookId}, '${escapedContent}')`;
        if (i < questions.length - 1) {
          values += ', ';
  }
}

const query = `INSERT INTO Questions (BookID, Question) VALUES ${values}`;
executeQuery(query);
    }
    catch(error){
      console.error(error);
      return null;
    }

}

async function saveQuiz(bookId: number, userId: number, questions: Question[], quizId:string,score?:number,totalQuestions?:number) {
  try {
    const escapedQuizContent = JSON.stringify(questions).replace(/'/g, "''");

    const query = `
      INSERT INTO Quiz (quizId, userId, quiz, score, total_questions, bookId)
      VALUES ('${quizId}', '${userId}', '${escapedQuizContent}', ${score || null}, ${totalQuestions || null}, ${bookId});
    `;
    executeQuery(query);
}
catch(error){

}

}
async function getFlashObject(bookId: number){
  let query = `SELECT * FROM FLASHCARD WHERE bookid = ${bookId}`;
  let result = await executeQuery(query);
  return result;
}

async function getExistingQuestions(bookId: number){
  let query = `
    SELECT *
    FROM Questions
    WHERE bookId = ${bookId}
    ORDER BY RANDOM()
    LIMIT 10`;

  let result = await executeQuery(query);
  result = result.map(row => row.question)
  return result;
}

async function updateQuizResult(bookId:number, userId:string, quizId:string, quizPaper:QuizPaper) {
  try {
    const escapedQuizContent = JSON.stringify(quizPaper.questions).replace(/'/g, "''");

    const query = `
      UPDATE Quiz SET quiz = '${escapedQuizContent}', score = ${quizPaper.quizScore}, total_questions = ${quizPaper.questions.length} WHERE quizId = '${quizId}';
      
    `;
    
    return await executeQuery(query);
}
catch(error){
  console.error(error);
  return null;
}
}

export {
  updateChapterCompletionStatus,
  getChapterConversationByChapterId,
  bookInsertion,
  chapterInsertion,
  ChapterConversation,
  chapterContentInsertion,
  getAllBooksOfUser,
  getBookChaptersByBookId,
  getChapterDataByChapterId,
  chapterContentUpdate,
  getBookByBookIdAndUserId,
  setPayDetailsWebhookNeon,
  setPayDetailsNeon,
  saveFlashCardGenerated,
  getFlashObject,
  getExistingQuestions,
  saveNewQuestions,
  saveQuiz,
  updateQuizResult
};
