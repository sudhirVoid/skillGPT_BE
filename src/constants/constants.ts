// here we will import all the env variables
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT
const GPT_API_KEY = process.env.GPT_API_KEY

export {PORT, GPT_API_KEY}