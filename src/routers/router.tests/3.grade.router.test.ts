import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import gradeRouter from '../3.grade.router';
import service from '../../services/3.grade.service';
import { errorHandler } from '../../middleware/error.middleware';

// Mock the grade service
vi.mock('../../services/3.grade.service', () => ({
    default: {
        getAllForSubject: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Grade Router', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/grades', gradeRouter);
        app.use(errorHandler);
        vi.clearAllMocks();
    });

    describe('GET /', () => {
        it('should return all grades for a subject using query parameter', async () => {
            const mockGrades = [{ id: '1', grade: 95, type: 'exam', date: '2023-01-01' }];
            vi.mocked(service.getAllForSubject).mockResolvedValueOnce(mockGrades);

            const response = await request(app).get('/grades?subjectId=123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockGrades);
            expect(service.getAllForSubject).toHaveBeenCalledWith('123');
        });

        it('should handle errors when fetching grades with query parameter', async () => {
            vi.mocked(service.getAllForSubject).mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/grades?subjectId=123');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /:subjectId', () => {
        it('should return all grades for a subject using path parameter', async () => {
            const mockGrades = [{ id: '1', grade: 90, type: 'quiz', date: '2023-01-15' }];
            vi.mocked(service.getAllForSubject).mockResolvedValueOnce(mockGrades);

            const response = await request(app).get('/grades/123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockGrades);
            expect(service.getAllForSubject).toHaveBeenCalledWith('123');
        });

        it('should handle errors when fetching grades with path parameter', async () => {
            vi.mocked(service.getAllForSubject).mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/grades/123');

            expect(response.status).toBe(500);
        });
    });

    describe('POST /', () => {
        it('should create a new grade', async () => {
            const newGrade = { id: '1', subjectId: '123', grade: 85, type: 'homework', date: '2023-02-01' };
            vi.mocked(service.create).mockResolvedValueOnce(newGrade);

            const response = await request(app)
                .post('/grades')
                .send({ subjectId: '123', grade: 85, type: 'homework', date: '2023-02-01' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: 'Grade created.', newGrade });
            expect(service.create).toHaveBeenCalledWith('123', 85, 'homework', '2023-02-01');
        });

        it('should handle errors when creating a grade', async () => {
            vi.mocked(service.create).mockRejectedValueOnce(new Error('Invalid data'));

            const response = await request(app)
                .post('/grades')
                .send({ subjectId: '123', grade: 85, type: 'homework', date: '2023-02-01' });

            expect(response.status).toBe(500);
        });
    });

    describe('PUT /:id', () => {
        it('should update a grade', async () => {
            const updatedGrade = { id: '1', grade: 88, type: 'quiz', date: '2023-03-01' };
            vi.mocked(service.update).mockResolvedValueOnce(updatedGrade);

            const response = await request(app)
                .put('/grades/1')
                .send({ grade: 88, type: 'quiz', date: '2023-03-01' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Grade updated.', updatedGrade });
            expect(service.update).toHaveBeenCalledWith('1', 88, 'quiz', '2023-03-01');
        });

        it('should handle errors when updating a grade', async () => {
            vi.mocked(service.update).mockRejectedValueOnce(new Error('Grade not found'));

            const response = await request(app)
                .put('/grades/999')
                .send({ grade: 88, type: 'quiz', date: '2023-03-01' });

            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete a grade', async () => {
            const deletedGrade = { id: '1', grade: 90, type: 'midterm', date: '2023-04-01' };
            vi.mocked(service.delete).mockResolvedValueOnce(deletedGrade);

            const response = await request(app).delete('/grades/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Grade deleted.', deletedGrade });
            expect(service.delete).toHaveBeenCalledWith('1');
        });

        it('should handle errors when deleting a grade', async () => {
            vi.mocked(service.delete).mockRejectedValueOnce(new Error('Grade not found'));

            const response = await request(app).delete('/grades/999');

            expect(response.status).toBe(500);
        });
    });
});