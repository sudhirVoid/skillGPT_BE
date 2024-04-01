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
exports.chapterInsertion = exports.bookInsertion = exports.getPgVersion = void 0;
const serverless_1 = require("@neondatabase/serverless");
const constants_1 = require("../constants/constants");
const sql = (0, serverless_1.neon)(constants_1.DATABASEURL);
function getPgVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield sql `SELECT version()`;
        console.log(result);
    });
}
exports.getPgVersion = getPgVersion;
function bookInsertion(bookTitle) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield sql `INSERT INTO BOOKS (title) VALUES ('${bookTitle}') RETURNING *;`;
        console.log(result);
    });
}
exports.bookInsertion = bookInsertion;
function chapterInsertion(bookId, chapters) {
    return __awaiter(this, void 0, void 0, function* () {
        let wholeQuery = "";
        for (let i = 0; i < chapters.length; i++) {
            let chapterTitle = chapters[i];
            wholeQuery += `INSERT INTO CHAPTERS (book_id, chapter_title) VALUES (${bookId}, '${chapterTitle}');`;
        }
        let result = yield sql `${wholeQuery}`;
        console.log(result);
    });
}
exports.chapterInsertion = chapterInsertion;
