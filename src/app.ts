import express, { Request, Response } from 'express';
import { join } from 'path';
import apikey from './middleware/apikey.middleware';
import auth from './middleware/auth.middleware';
import authRouter from '@routes/auth.router';
import semesterRouter from '@routes/semester.router';
import subjectRouter from '@routes/subject.router';
import gradeRouter from '@routes/grade.router';

const app = express();
const __dirname = __filename;
const staticPath = join(__dirname, '..', 'public');

// Middleware
app.use(express.static(staticPath));
app.use(express.json());

// Health Router
const health = express.Router();
health.get('/', (req: Request, res: Response) => {
  res.status(200).json('Healthy');
});

// App Route Definitions
app.use('/health', apikey, health);
app.use('/auth', apikey, auth, authRouter);
app.use('/semesters', apikey, auth, semesterRouter);
app.use('/subjects', apikey, auth, subjectRouter);
app.use('/grades', apikey, auth, gradeRouter);

export default app;
