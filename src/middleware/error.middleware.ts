import { Request, Response, NextFunction } from 'express';
import * as custom from '@utils/custom.error';

export const errorHandler = (err: Error, _req: Request, res: Response): Response => {
  console.error(err.stack);

  const errObj = { error: err.name, message: err.message };
  let httpStatus;

  if (
    err instanceof custom.ConflictError ||
    err instanceof custom.NotFoundError ||
    err instanceof custom.InvalidError
  ) {
    httpStatus = err.statusCode;
  } else {
    httpStatus = 300;
  }

  return res.status(httpStatus).json(errObj);
};

export const routeNotFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new custom.NotFoundError(`Route not found: ${req.originalUrl}`);
  next(error);
};
