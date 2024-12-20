
export const getOldBookDataQuery= (userId: string, bookId:number):string=>{
    let query = `SELECT
                  B.book_id AS bookId,
                  B.title AS bookTitle,
                  B.booklanguage AS bookLanguage,
                  B.user_id AS userId,
                  C.chapter_id AS chapterId,
                  C.chapter_title AS chapterTitle,
                  C.is_completed AS isChapterCompleted,
                  Co.content_id AS contentId,
                  Co.content_text AS contentText
                 FROM Books B
                  INNER JOIN Chapters C
                  ON B.book_id = C.book_id
                  LEFT JOIN Content Co
                  ON C.chapter_id = Co.chapter_id
                  WHERE B.user_id = '${userId}'
                    AND B.book_id = ${bookId};`
    return query;
};

export const getBookContentInSingleStringQuery = (userId: string, bookId: number):string=>{
  let query = ` SELECT 
    B.book_id AS "bookId",
    B.user_id AS "userId",
    STRING_AGG(Co.gpt_content, ' ') AS "bookContent"
FROM Books B
INNER JOIN Chapters C
    ON B.book_id = C.book_id
LEFT JOIN (
    SELECT 
        chapter_id, 
        STRING_AGG(content_element->>'gpt', ' ') AS gpt_content
    FROM Content,
    jsonb_array_elements(content_text) AS content_element
    WHERE content_element ? 'gpt'
    GROUP BY chapter_id
) Co
    ON C.chapter_id = Co.chapter_id
WHERE B.user_id = '${userId}'
  AND B.book_id = ${bookId}
GROUP BY B.book_id, B.user_id; `;
return query;
}