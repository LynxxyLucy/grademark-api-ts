import { Request, Response, NextFunction } from 'express';

const APIKEY = process.env.APIKEY;

if (!APIKEY) {
  console.warn('Warning: APIKEY is not set in environment variables');
}

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get API key from request headers
  const apiKey = req.headers['apikey'] || req.query.apiKey;

  // Check if API key is valid
  if (!apiKey || apiKey !== APIKEY) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing API key' 
    });
  }

  next();
};

export default apiKeyMiddleware;