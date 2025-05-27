import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { routeNotFoundHandler, errorHandler } from '../error.middleware';
import { CustomError, NotFoundError } from '../../utils/custom.error';

describe('Error Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction & ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockRequest = {
            originalUrl: '/test-url'
        };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        nextFunction = vi.fn();
    });

    describe('routeNotFoundHandler', () => {
        it('should create a NotFoundError with the original URL', () => {
            routeNotFoundHandler(mockRequest as Request, mockResponse as Response, nextFunction);
            
            expect(nextFunction).toHaveBeenCalledTimes(1);
            const error = nextFunction.mock.calls[0][0];
            expect(error).toBeInstanceOf(NotFoundError);
            expect(error.message).toBe('Route not found: /test-url');
        });
    });

    describe('errorHandler', () => {
        it('should handle CustomError with correct status code', () => {
            const customError = new CustomError('Custom error');
            
            errorHandler(customError, mockRequest as Request, mockResponse as Response, nextFunction);
            
            expect(mockResponse.status).toHaveBeenCalledWith(418);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: customError.name,
                message: customError.message
            });
            expect(nextFunction).toHaveBeenCalled();
        });
        
        it('should handle TypeError with 400 status code', () => {
            const typeError = new TypeError('Type error occurred');
            
            errorHandler(typeError, mockRequest as Request, mockResponse as Response, nextFunction);
            
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: typeError.name,
                message: typeError.message
            });
            expect(nextFunction).toHaveBeenCalled();
        });
        
        it('should handle generic Error with 500 status code', () => {
            const genericError = new Error('Something went wrong');
            
            errorHandler(genericError, mockRequest as Request, mockResponse as Response, nextFunction);
            
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: genericError.name,
                message: genericError.message
            });
            expect(nextFunction).toHaveBeenCalled();
        });
        
        it('should set Content-Type header to application/json', () => {
            const error = new Error('Test error');
            
            errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
            
            expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'application/json');
        });
        
        it('should log error stack to console', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Console log test');
            
            errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
            
            expect(consoleSpy).toHaveBeenCalledWith(error.stack);
            consoleSpy.mockRestore();
        });
    });
});