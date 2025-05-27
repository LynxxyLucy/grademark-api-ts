import express, { Request, Response } from 'express';
import { join } from 'path';
import apikey from './middleware/apikey.middleware';
import auth from './middleware/auth.middleware';
import authRouter from '@root/src/routers/0.auth.router';
import semesterRouter from '@root/src/routers/1.semester.router';
import subjectRouter from '@root/src/routers/2.subject.router';
import gradeRouter from '@root/src/routers/3.grade.router';
import { errorHandler, routeNotFoundHandler } from './middleware/error.middleware';

const app = express();
const __dirname = __filename;
const staticPath = join(__dirname, '..', 'public');

// Middleware
app.use(express.static(staticPath));
app.use(express.json());

// Health Router
const health = express.Router();
health.get('/', (req: Request, res: Response) => {
  res.status(200).send('Healthy');
});

// App Route Definitions
app.use('/', (req: Request, res: Response) => {
  res.status(200).send('Hi :3');
});
app.use('/health', health);
app.use('/auth', apikey, authRouter);
app.use('/semesters', apikey, auth, semesterRouter);
app.use('/subjects', apikey, auth, subjectRouter);
app.use('/grades', apikey, auth, gradeRouter);

app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
