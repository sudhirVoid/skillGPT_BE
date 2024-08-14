// here we will import all the env variables
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT
const GPT_API_KEY = process.env.GPT_API_KEY
const PGUSER = process.env.PGUSER
const PGHOST = process.env.PGHOST
const PGDATABASE = process.env.PGDATABASE
const PGPASSWORD = process.env.PGPASSWORD
const PGPORT = process.env.PGPORT
const DATABASEURL = process.env.DATABASEURL
const RAZORPAYKEYID = process.env.RAZORPAYKEYID
const RAZORPAYKEYSECRET = process.env.RAZORPAYKEYSECRET
export {PORT, GPT_API_KEY, PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, DATABASEURL, RAZORPAYKEYID, RAZORPAYKEYSECRET}