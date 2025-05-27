import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import apiKeyMiddleware from '../apikey.middleware';
import { UnauthorizedError } from '../../utils/custom.error';

describe('API Key Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const originalEnv = process.env;

  beforeEach(() => {
    req = {
      headers: {},
      query: {},
    };
    res = {};
    next = vi.fn();

    // Save and reset environment variables
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.APIKEY = 'test-api-key';
  });

  afterEach(() => {
    //process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should call next() when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';

    apiKeyMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() when valid API key is in headers', () => {
    req.headers = { apikey: 'test-api-key' };

    apiKeyMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() when valid API key is in query params', () => {
    req.query = { apiKey: 'test-api-key' };

    apiKeyMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when API key is missing', () => {
    // Set NODE_ENV to something other than 'test' for this specific test
    process.env.NODE_ENV = 'development';

    expect(() => {
      apiKeyMiddleware(req as Request, res as Response, next);
    }).toThrow(UnauthorizedError);
    expect(() => {
      apiKeyMiddleware(req as Request, res as Response, next);
    }).toThrow('Invalid or missing API key');
  });

  it('should throw UnauthorizedError when API key is invalid', () => {
    process.env.NODE_ENV = 'development';
    req.headers = { apikey: 'wrong-api-key' };

    expect(() => {
      apiKeyMiddleware(req as Request, res as Response, next);
    }).toThrow(UnauthorizedError);
    expect(() => {
      apiKeyMiddleware(req as Request, res as Response, next);
    }).toThrow('Invalid or missing API key');
  });

  it('should log warning when APIKEY env var is not set and not in test mode', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.APIKEY = undefined;
    process.env.NODE_ENV = 'development';

    apiKeyMiddleware(req as Request, res as Response, next);

    expect(consoleSpy).toHaveBeenCalledWith('Warning: APIKEY is not set in environment variables');
    consoleSpy.mockRestore();
  });
});
