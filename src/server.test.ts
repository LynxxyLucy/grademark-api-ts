import { describe, it, vi, expect, beforeEach } from 'vitest';
import app from './app';

// Mock the app.listen method
vi.mock('./app', () => ({
    default: {
        listen: vi.fn((port, callback) => {
            callback();
            return { close: vi.fn() };
        })
    }
}));

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log');
consoleSpy.mockImplementation(() => {});

describe('Server', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.resetAllMocks();
    });

    it('should start the server on the specified PORT from environment variable', async () => {
        process.env.PORT = '4000';
        
        // Import server to trigger the code
        await import('./server');
        
        expect(app.listen).toHaveBeenCalledWith('4000', expect.any(Function));
        expect(consoleSpy).toHaveBeenCalledWith('Server is runing on port 4000');
    });

    it('should start the server on default port 3000 when PORT environment variable is not set', async () => {
        delete process.env.PORT;
        
        // Import server to trigger the code
        await import('./server');
        
        expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
        expect(consoleSpy).toHaveBeenCalledWith('Server is runing on port 3000');
    });
});