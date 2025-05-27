import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/custom.error';


/* const APIKEY = process.env.APIKEY;
const NODE_ENV = process.env.NODE_ENV; */

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  
  if (!process.env.APIKEY && process.env.NODE_ENV !== 'test') {
    console.warn('Warning: APIKEY is not set in environment variables');
    return next();
  }

  // Get API key from request headers
  const apiKey = req.headers['apikey'] || req.query.apiKey;

  // Check if API key is valid
  if (!apiKey || apiKey !== process.env.APIKEY) {
    throw new UnauthorizedError('Invalid or missing API key');
  }

  next();
};

export default apiKeyMiddleware;
