import { Request, Response, NextFunction } from 'express';
import * as custom from '@utils/custom.error';

export const routeNotFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new custom.NotFoundError(`Route not found: ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const errObj = { error: err.name, message: err.message };
  let httpStatus;

  if (
    err instanceof custom.ConflictError ||
    err instanceof custom.NotFoundError ||
    err instanceof custom.InvalidError
  ) {
    httpStatus = err.statusCode;
  } else if (err instanceof TypeError) {
    httpStatus = 400; // Bad Request
  } else {
    httpStatus = 500;
  }

  res.status(httpStatus).set('Content-Type', 'application/json').json(errObj);
  next();
};
