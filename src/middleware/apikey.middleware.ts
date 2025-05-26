import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/custom.error';

const APIKEY = process.env.APIKEY;
const NODE_ENV = process.env.NODE_ENV;

if (!APIKEY && NODE_ENV !== 'test') {
  console.warn('Warning: APIKEY is not set in environment variables');
}

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === 'test') {
    next();
  }

  // Get API key from request headers
  const apiKey = req.headers['apikey'] || req.query.apiKey;

  // Check if API key is valid
  if (!apiKey || apiKey !== APIKEY) {
    throw new UnauthorizedError('Invalid or missing API key');
  }

  next();
};

export default apiKeyMiddleware;
