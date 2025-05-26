import { Request, Response, NextFunction } from 'express';
import * as custom from '@utils/custom.error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  const errorObject = { error: err.name, message: err.message };
  let httpStatus = 500;

  if (err instanceof custom.ConflictError) {
    httpStatus = 409;
  }

  if (err instanceof custom.NotFoundError) {
    httpStatus = 404;
  }

  if (err instanceof custom.InvalidError) {
    httpStatus = 418;
  }

  res.status(httpStatus).json(errorObject);
  next();
};

export const routeNotFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new custom.NotFoundError(`Route not found: ${req.originalUrl}`);
  next(error);
};
