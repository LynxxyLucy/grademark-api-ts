import express, { Request, Response } from 'express';
import { join } from 'path';
import authMiddleware from './middleware/auth.middleware';
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
app.use('/health', health);
app.use('/auth', authMiddleware, authRouter);
app.use('/semesters', authMiddleware, semesterRouter);
app.use('/subjects', authMiddleware, subjectRouter);
app.use('/grades', authMiddleware, gradeRouter);

export default app;
