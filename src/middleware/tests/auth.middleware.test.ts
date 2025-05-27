import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import authMiddleware from '../auth.middleware';
import jwt from 'jsonwebtoken';
import { object } from 'joi';

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const originalEnv = process.env;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
    };
    next = vi.fn();
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret' };
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it('should return 401 if no token is provided', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'No token provided.' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 500 if JWT_SECRET is not set', () => {
    req.headers = { authorization: 'valid-token' };
    process.env.JWT_SECRET = undefined;

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing JWT Secret.' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers = { authorization: 'invalid-token' };
    vi.mocked(jwt.verify).mockImplementationOnce((token, secret, options) => {
      const callback = options as (err: Error | null, decoded?: object | string) => void;
      callback(new Error('Invalid token'), object as unknown as object);
      return undefined as unknown;
    });

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'Invalid token.' });
    expect(next).toHaveBeenCalled();
  });
  it('should set userId from decoded token payload', () => {
    req.headers = { authorization: 'valid-token' };
    const mockDecodedPayload = { id: 'user-123', key: 'some-key' };
    vi.mocked(jwt.verify).mockImplementationOnce((token, secret, options) => {
      const callback = options as (err: Error | null, decoded?: object | string) => void;
      callback(null, mockDecodedPayload);
      return undefined as unknown;
    });

    authMiddleware(req as Request, res as Response, next);

    expect(req.userId).toEqual('user-123');
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret', expect.any(Function));
    expect(next).toHaveBeenCalled();
  });
});
