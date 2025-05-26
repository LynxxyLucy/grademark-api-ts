import { Request, Response, NextFunction } from 'express';
import { CustomError, NotFoundError } from '@utils/custom.error';

export const routeNotFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route not found: ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const ErrorObject = { error: err.name, message: err.message };
  let httpStatus;

  // Determine HTTP status code based on error type
  if (err instanceof CustomError) {
    // If it's one of our custom errors, use its status code
    httpStatus = err.statusCode;
  } else if (err instanceof TypeError) {
    httpStatus = 400; // Bad Request
  } else {
    httpStatus = 500; // Internal Server Error
  }

  res.status(httpStatus).set('Content-Type', 'application/json').json(ErrorObject);
  next();
};
