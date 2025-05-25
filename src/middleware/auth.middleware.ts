import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Missing JWT Secret." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.status(401).send({ message: "Invalid token." });
    req.userId = (decoded as any).id;
    next();
  });
}

export default authMiddleware;
