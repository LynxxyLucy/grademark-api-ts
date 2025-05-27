import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import subjectRouter from '../../routers/2.subject.router';
import subjectService from '../../services/2.subject.service';
import { errorHandler } from '../../middleware/error.middleware';
import { NotFoundError } from '../../utils/custom.error';

// Mock the subject service
vi.mock('../../services/2.subject.service');

describe('Subject Router', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.resetAllMocks();
    app = express();
    app.use(express.json());
    app.use('/subjects', subjectRouter);
    app.use(errorHandler);
  });

  describe('GET /', () => {
    it('should return all subjects for a semester', async () => {
      const mockSubjects = [
        { id: '1', name: 'Math', semesterId: '123' },
        { id: '2', name: 'Science', semesterId: '123' },
      ];

      vi.mocked(subjectService.getAllForSemester).mockResolvedValue(mockSubjects);

      const response = await request(app).get('/subjects').send({ semesterId: '123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubjects);
      expect(subjectService.getAllForSemester).toHaveBeenCalledWith('123');
    });

    it('should handle errors when getting all subjects', async () => {
      vi.mocked(subjectService.getAllForSemester).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/subjects').send({ semesterId: '123' });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /:id', () => {
    it('should return a subject by id', async () => {
      const mockSubject = { id: '1', name: 'Math', semesterId: '123', grades: [] };

      vi.mocked(subjectService.getUniqueByIdWithGrades).mockResolvedValue(mockSubject);

      const response = await request(app).get('/subjects/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubject);
      expect(subjectService.getUniqueByIdWithGrades).toHaveBeenCalledWith('1');
    });

    it('should return 404 if subject not found', async () => {
      vi.mocked(subjectService.getUniqueByIdWithGrades).mockRejectedValue(new NotFoundError('Subject not found.'));

      const response = await request(app).get('/subjects/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "NotFoundError", message: 'Subject not found.' });
    });

    it('should handle errors when getting a subject', async () => {
      vi.mocked(subjectService.getUniqueByIdWithGrades).mockRejectedValue(
        new Error('Database error'),
      );

      const response = await request(app).get('/subjects/1');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /', () => {
    it('should create a new subject', async () => {
      const newSubject = { id: '3', name: 'History', semesterId: '123' };

      vi.mocked(subjectService.create).mockResolvedValue(newSubject);

      const response = await request(app)
        .post('/subjects')
        .send({ name: 'History', semesterId: '123' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Subject created.', newSubject });
      expect(subjectService.create).toHaveBeenCalledWith('History', '123');
    });

    it('should handle errors when creating a subject', async () => {
      vi.mocked(subjectService.create).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/subjects')
        .send({ name: 'History', semesterId: '123' });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /:id', () => {
    it('should update a subject', async () => {
      const updatedSubject = { id: '1', name: 'Advanced Math', semesterId: '123' };

      vi.mocked(subjectService.update).mockResolvedValue(updatedSubject);

      const response = await request(app).put('/subjects/1').send({ name: 'Advanced Math' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Subject updated.', updatedSubject });
      expect(subjectService.update).toHaveBeenCalledWith('1', 'Advanced Math');
    });

    it('should handle errors when updating a subject', async () => {
      vi.mocked(subjectService.update).mockRejectedValue(new Error('Database error'));

      const response = await request(app).put('/subjects/1').send({ name: 'Advanced Math' });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a subject', async () => {
      const deletedSubject = { id: '1', name: 'Math', semesterId: '123' };

      vi.mocked(subjectService.delete).mockResolvedValue(deletedSubject);

      const response = await request(app).delete('/subjects/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Subject deleted.', subject: 'Math' });
      expect(subjectService.delete).toHaveBeenCalledWith('1');
    });

    it('should handle errors when deleting a subject', async () => {
      vi.mocked(subjectService.delete).mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/subjects/1');

      expect(response.status).toBe(500);
    });
  });
});
