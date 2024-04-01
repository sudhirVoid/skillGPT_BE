import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, DATABASEURL } from '../constants/constants';

const pool = new Pool(
  {
    connectionString: DATABASEURL
  }
)

async function getPgVersion() {
  const result = await pool.query('SELECT * FROM BOOKS');
  console.log(result);
}
// const sql = neon(DATABASEURL!)

// async function getPgVersion() {
//   const result = await sql`SELECT version()`;
//   console.log(result);
// }
// async function bookInsertion(bookTitle: string){
//   // let query = `INSERT INTO BOOKS (title) VALUES ('${bookTitle}') RETURNING *;`;
//   let query = `Select * from Books`;
//   let [result] = await sql`${query}`;
//   console.log(result)
// }

// async function chapterInsertion(bookId: number, chapters: string[]) {
//   let wholeQuery = ""
//   for (let i = 0; i < chapters.length; i++) {
//     let chapterTitle = chapters[i];
//     wholeQuery += `INSERT INTO CHAPTERS (book_id, chapter_title) VALUES (${bookId}, '${chapterTitle}');`;
//   }

//   let result = await sql`${wholeQuery}`;
//   console.log(result)
  
// }

export { getPgVersion };
