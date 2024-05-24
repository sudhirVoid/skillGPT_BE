import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, DATABASEURL } from '../constants/constants';

const pool = new Pool(
  {
    connectionString: DATABASEURL
  }
)
interface ChapterConversation{
  chapterId: number,
  content: {
    gpt: string,
    user?: string //user is optional
  }[]
}
async function getPgVersion() {
  const result = await pool.query('SELECT * FROM BOOKS');
}

// insert book title in table name BOOKS
async function bookInsertion(bookTitle: string, bookLanguage: string, userId: string){
  let query = `INSERT INTO BOOKS (title,booklanguage, user_id) VALUES ('${bookTitle}','${bookLanguage}', '${userId}') RETURNING book_id , title, user_id;`;

  let result = await pool.query(query);
  return result.rows[0]
}

async function chapterInsertion(bookId: number, chapters: string[]) {
  let query = "INSERT INTO CHAPTERS (book_id, chapter_title) VALUES ";
  for (let i = 0; i < chapters.length; i++) {
    if(i===chapters.length-1){
      query += `(${bookId}, '${chapters[i]}') RETURNING chapter_id as chapterId, chapter_title as chapterTitle;`;
      continue
    }
    query += `(${bookId}, '${chapters[i]}'),`;
  }

  let result = await pool.query(query)
  return result.rows
  
}

async function chapterContentInsertion(chapterDetails: ChapterConversation){
  let query = `INSERT INTO CONTENT (chapter_id, content_text) VALUES (${chapterDetails.chapterId},'${JSON.stringify(chapterDetails.content)}') RETURNING content_id, content_text ;`

  let result = await pool.query(query)
  return result.rows
}

async function getAllBooksOfUser(userId: string){
  let query = `SELECT * FROM BOOKS WHERE user_id = '${userId}';`
  let result = await pool.query(query)
  return result.rows
}

async function getBookChaptersByBookId(bookId: string){
  let query = `SELECT * FROM CHAPTERS WHERE book_id = ${bookId};`
  let result = await pool.query(query)
  return result.rows
};

async function getChapterDataByChapterId(chapterId: string){
  let query = `SELECT * FROM CONTENT WHERE chapter_id = ${chapterId};`
  let result = await pool.query(query)
  return result.rows
};

export { getPgVersion, bookInsertion, chapterInsertion, ChapterConversation,chapterContentInsertion, getAllBooksOfUser,getBookChaptersByBookId, getChapterDataByChapterId};
