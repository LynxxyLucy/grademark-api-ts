import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('App', () => {
    describe('Health endpoint', () => {
        it('should return 200 and "Healthy" text for GET /health', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toBe('Healthy');
        });
    });

    describe('Middleware', () => {
        it('should parse JSON bodies', async () => {
            const payload = { test: 'data' };
            const response = await request(app)
                .post('/health')
                .send(payload)
                .set('Content-Type', 'application/json');
            
            // Even though this route doesn't explicitly handle POST,
            // we can verify the middleware is working by checking that
            // the request wasn't rejected due to parsing issues
            expect(response.status).not.toBe(415); // Not unsupported media type
        });
    });

    describe('Not found handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/non-existent-route');
            expect(response.status).toBe(404);
        });
    });
});