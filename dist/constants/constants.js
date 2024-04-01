"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASEURL = exports.PGPORT = exports.PGPASSWORD = exports.PGDATABASE = exports.PGHOST = exports.PGUSER = exports.GPT_API_KEY = exports.PORT = void 0;
// here we will import all the env variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT;
exports.PORT = PORT;
const GPT_API_KEY = process.env.GPT_API_KEY;
exports.GPT_API_KEY = GPT_API_KEY;
const PGUSER = process.env.PGUSER;
exports.PGUSER = PGUSER;
const PGHOST = process.env.PGHOST;
exports.PGHOST = PGHOST;
const PGDATABASE = process.env.PGDATABASE;
exports.PGDATABASE = PGDATABASE;
const PGPASSWORD = process.env.PGPASSWORD;
exports.PGPASSWORD = PGPASSWORD;
const PGPORT = process.env.PGPORT;
exports.PGPORT = PGPORT;
const DATABASEURL = process.env.DATABASEURL;
exports.DATABASEURL = DATABASEURL;
