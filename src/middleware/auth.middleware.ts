import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Define the JWT payload structure
interface JWTPayload {
  id: string;
  key: string;
}

// Extend Express Request interface using module augmentation
declare module 'express' {
  interface Request {
    userId?: string;
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(401).send({ message: 'No token provided.' });
  } else if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'Missing JWT Secret.' });
  } else {
    jwt.verify(token.toString(), process.env.JWT_SECRET, (error, decoded) => {
      if (error) res.status(401).send({ message: 'Invalid token.' });
      req.userId = (decoded as JWTPayload).id;
    });
  }
  next();
};

export default authMiddleware;
