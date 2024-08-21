import { Router, Request, Response } from "express";
import {
  syllabusGenerator,
  SyllabusConfig,
  ChapterConfig,
  chapterGenerator,
  ChapterConversationConfig,
  chapterConversationHandler,
} from "../controllers/gptController";
import { bookInsertion,chapterInsertion,ChapterConversation, chapterContentInsertion, chapterContentUpdate, getChapterConversationByChapterId, getBookByBookIdAndUserId  } from "../controllers/db";
import puppeteer from 'puppeteer';
import fs from 'fs'
import path from 'path'
const html_to_pdf = require('html-pdf-node');
const router: Router = Router();

router.post("/syllabus", async (req: Request, res: Response) => {
  let syllabus: SyllabusConfig = req.body;
  let chapters = await syllabusGenerator(syllabus);
//   res.json({ chapters: syllabusTopics, topic: syllabus.bookTopic });



    //insert bookTopic
    /*
    return object like:
    { book_id: 1, title: 'Physics' }

    */
    let bookResult = await bookInsertion(syllabus.bookTopic, syllabus.language, syllabus.userId);
    let bookId = bookResult?.book_id;
    //insert chapters and returns chapter with their id at insertion time.
    /*
    [
    { chapterid: 10, chaptertitle: 'Exploración espacial' },
    { chapterid: 11, chaptertitle: 'Los planetas del sistema solar' }]

    */
    let chapterResult = await chapterInsertion(bookId, chapters);
    //TODO: 
  res.json({
    chaptersData: chapterResult,
    topicData: bookResult,
    
  });

  // res.json(
  //   {
  //     chapterData: [
  //       { chapterid: 10, chaptertitle: 'Exploración espacial' },
  //       { chapterid: 11, chaptertitle: 'Los planetas del sistema solar' }],
  //       topicData: { book_id: 1, title: 'Physics' }
  //   }
  // )
});

//TODO: need to check in db if that chapter already exists or not . if doesnot exist then only generate with chatgpt.
router.post("/chapter", async (req: Request, res: Response) => {
  let chapter: ChapterConfig = req.body;
  //here chapterContent is pure html.
  // check if the chapterid already exists in the content table.
  let chapterData = await getChapterConversationByChapterId(chapter.chapterId);
  if(chapterData.length > 0){
    res.json({msg: chapterData});
  }
  else{
  let chapterContent = await chapterGenerator(chapter);
  let chapterConversation: ChapterConversation = {
    chapterId: chapter.chapterId,
    content: [{
      gpt: chapterContent
    }]
  }
  let chapterContentResult = await chapterContentInsertion(chapterConversation)
  res.json({msg: chapterContentResult});
}
  // res.setHeader("Content-Type", "text/html");
});

router.post("/chapterConversation", async (req: Request, res: Response) => {
  /*
  content: {
        gpt: string,
        user?: string
    }[]
    here we change [{role: 'agent', content: 'hello'}] we have system, agent, user.
    gpt-agent
    user-user 
  */
  let chapterConversation: ChapterConversationConfig = req.body;

  // send this to chapterConversationHandler
  let conversationResult = await chapterConversationHandler(chapterConversation)
  /*
    response structure is this:
    {
        gpt: gptResponse,
        user: currentUser
    }

  */
    chapterConversation.content.push(conversationResult as any)
    //insert in database.
    let updateConversationObject: ChapterConversation = {
      chapterId: chapterConversation.chapterDetails.chapterId,
      content: chapterConversation.content
    }
    await chapterContentUpdate(updateConversationObject)
  res.json({msg: conversationResult});
});
router.get('/generatePdf', async (req: Request, res: Response) => {
  let {bookId, userId} = req.query;
  let browser;
  try {
    let bookData = await getBookByBookIdAndUserId(Number(bookId), String(userId));
    let bookName = bookData[0]['booktitle'];
    const margins = { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' };
    const pdfDirPath = path.join(__dirname, 'pdfFiles');
    const pdfFilePath = path.join(pdfDirPath, bookName);

    if (!fs.existsSync(pdfDirPath)) {
      fs.mkdirSync(pdfDirPath, { recursive: true });
    }
    browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ]
    });
    const page = await browser.newPage();
    let PDFContent = "";
    let tableOfContent = '<h1>Table of Contents</h1>';
    bookData.forEach(data => {
      const chapterId = `chapter-${data.chapterid}`;
      tableOfContent += `<li><p id="${chapterId}">${data.chaptertitle}</p></li>`;

  // Generate Content
      if (data.contenttext !== null) {
        data.contenttext.forEach((chapterData: { gpt: string; user: string; }) => {
          if (chapterData.gpt) {
            PDFContent += `<div style="
              background-color: #CCFFCC; /* light background for GPT */
              color: 003049; /* text color */
              padding: 10px;
              border-radius: 10px;
              margin-bottom: 10px;
            ">${chapterData.gpt}</div>`;
          }
          if (chapterData.user) {
            PDFContent += `<div style="
              background-color: #e0efff; /* light blue background for user */
              color: green; /* text color */
              padding: 10px;
              border-radius: 10px;
              margin-bottom: 10px;
            ">${chapterData.user}</div>`;
          }
        });
      }
    });
    PDFContent = `<ul>${tableOfContent}</ul>` + PDFContent;

    // Set the content of the page
    await page.setContent(`<!DOCTYPE HTML>
      <html>
        <head>
          <title>${bookName}</title>
          <meta charset="utf-8" />
        </head>
        <body>
          ${PDFContent}
        </body>
      </html>`,
       {waitUntil: 'load'});


    // Generate the PDF
    await page.pdf({ path: pdfFilePath, format: 'A4', margin: margins, printBackground: true});

    // Send the PDF file as a response for download
    res.download(pdfFilePath, bookName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }

      // Optionally, delete the file after sending it
      fs.unlink(pdfFilePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});
// router.get('/generatePdf', async (req: Request, res: Response) => {
//   let {bookId, userId} = req.query;
//   try {
//     let bookData = await getBookByBookIdAndUserId(Number(bookId), String(userId));
//     let bookName = bookData[0]['booktitle'];
//     const pdfDirPath = path.join(__dirname, 'pdfFiles');

//     if (!fs.existsSync(pdfDirPath)) {
//       fs.mkdirSync(pdfDirPath, { recursive: true });
//     }
//     let PDFContent = "";
//     let tableOfContent = '<h1>Table of Contents</h1>';
//     bookData.forEach(data => {
//       const chapterId = `chapter-${data.chapterid}`;
//       tableOfContent += `<li><p id="${chapterId}">${data.chaptertitle}</p></li>`;
  
//   // Generate Content
//       if (data.contenttext !== null) {
//         data.contenttext.forEach((chapterData: { gpt: string; user: string; }) => {
//           if (chapterData.gpt) {
//             PDFContent += `<div style="
//               background-color: #CCFFCC; /* light background for GPT */
//               color: 003049; /* text color */
//               padding: 10px;
//               border-radius: 10px;
//               margin-bottom: 10px;
//             ">${chapterData.gpt}</div>`;
//           }
//           if (chapterData.user) {
//             PDFContent += `<div style="
//               background-color: #e0efff; /* light blue background for user */
//               color: green; /* text color */
//               padding: 10px;
//               border-radius: 10px;
//               margin-bottom: 10px;
//             ">${chapterData.user}</div>`;
//           }
//         });
//       }
//     });
//     PDFContent = `<ul>${tableOfContent}</ul>` + PDFContent;
    
//     // Set the content of the page
//     let htmlContent = `<!DOCTYPE HTML>
//       <html>
//         <head>
//           <title>${bookName}</title>
//           <meta charset="utf-8" />
//         </head>
//         <body>
//           ${PDFContent}
//         </body>
//       </html>`;
      
//     // Generate the PDF
//     let file =  { content: htmlContent } ;
//     let options = { 
//       format: 'A4' ,
//       "displayHeaderFooter": true,
//       margin: {
//         top: '10mm',
//         right: '10mm',
//         bottom: '10mm',
//         left: '10mm'
//       }
//     };
//     // Send the PDF file as a response for download
//     html_to_pdf.generatePdf(file, options)
//     .then((pdfBuffer: any) => {
//       res.type('application/pdf');
//       res.send(pdfBuffer);
//     })
//     .catch((err: { message: string; }) => {
//       res.status(500).send('Error generating PDF: ' + err.message);
//     });
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     res.status(500).send('Error generating PDF');
//   } finally {
//   }
// });


export default router;
