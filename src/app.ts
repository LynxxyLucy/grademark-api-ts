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
  res.status(200).json('Healthy');
});

// App Route Definitions
app.use('/', (req: Request, res: Response) => {
  res.status(200).json('Hi :3');
  console.log("Works ^-^"); // Just for fun, as per the HTTP 418 status code
});
app.use('/teapot', (req: Request, res: Response) => {

  res.status(418).json('I\'m a teapot!'); // HTTP 418: I'm a teapot
  console.log("I'm a teapot!"); // Just for fun, as per the HTTP 418 status code
});
app.use('/health', health);
app.use('/auth', apikey, authRouter);
app.use('/semesters', apikey, auth, semesterRouter);
app.use('/subjects', apikey, auth, subjectRouter);
app.use('/grades', apikey, auth, gradeRouter);

app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
