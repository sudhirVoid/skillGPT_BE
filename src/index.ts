import express, { Request, Response, NextFunction } from 'express';
import contentGeneratorRouter  from './routes/generate';
import { PORT } from './constants/constants';
const app = express();
const port = PORT || 3000;

app.use(express.json());


// for all generating content from GPT we use this path requests.
app.use('/generate', contentGeneratorRouter);

// Add this error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
export default app;