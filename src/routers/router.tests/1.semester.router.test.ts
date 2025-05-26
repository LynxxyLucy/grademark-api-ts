import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import semesterRouter from '../1.semester.router';
import semesterService from '../../services/1.semester.service';
import { errorHandler } from '../../middleware/error.middleware';

// Mock the semester service
vi.mock('../../services/1.semester.service', () => ({
  default: {
    getAllForUser: vi.fn(),
    getUniqueByIdWithSubjects: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Semester Router', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/semesters', semesterRouter);
    app.use(errorHandler);
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should get all semesters for a user', async () => {
      const createdAt = new Date();
      const updatedAt = new Date();

      const mockSemesters = [
        {
          id: '1',
          semester: 'Fall 2023',
          createdAt: `${createdAt}`,
          updatedAt: `${updatedAt}`,
          userId: 'user123',
        },
        {
          id: '2',
          semester: 'Spring 2024',
          createdAt: `${createdAt}`,
          updatedAt: `${updatedAt}`,
          userId: 'user123',
        },
        {
          id: '2',
          semester: 'Spring 2024',
          createdAt: `${createdAt}`,
          updatedAt: `${updatedAt}`,
          userId: 'user123',
        },
      ];
      vi.mocked(semesterService.getAllForUser).mockResolvedValue(mockSemesters);

      const response = await request(app)
        .get('/semesters')
        .send({ userId: 'user123' })
        .query({ search: 'Fall' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSemesters);
      expect(semesterService.getAllForUser).toHaveBeenCalledWith('user123', 'Fall');
    });

    it('should handle errors when getting all semesters', async () => {
      vi.mocked(semesterService.getAllForUser).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/semesters').send({ userId: 'user123' });

      expect(response.status).not.toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('should get a specific semester by id', async () => {
      const mockSemester = {
        id: '1',
        name: 'Fall 2023',
        subjects: [{ id: 'subj1', name: 'Math' }],
      };
      vi.mocked(semesterService.getUniqueByIdWithSubjects).mockResolvedValue(mockSemester);

      const response = await request(app).get('/semesters/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSemester);
      expect(semesterService.getUniqueByIdWithSubjects).toHaveBeenCalledWith('1');
    });

    it('should handle errors when getting a specific semester', async () => {
      vi.mocked(semesterService.getUniqueByIdWithSubjects).mockRejectedValue(
        new Error('Not found'),
      );

      const response = await request(app).get('/semesters/999');

      expect(response.status).not.toBe(200);
    });
  });

  describe('POST /', () => {
    it('should create a new semester', async () => {
      const newSemester = { name: 'Fall 2023', startDate: '2023-09-01', endDate: '2023-12-31' };
      const createdSemester = { id: '1', ...newSemester };
      vi.mocked(semesterService.create).mockResolvedValue(createdSemester);

      const response = await request(app)
        .post('/semesters')
        .send({ userId: 'user123', semester: newSemester });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Semester created.');
      expect(response.body.newSemester).toEqual(createdSemester);
      expect(semesterService.create).toHaveBeenCalledWith('user123', newSemester);
    });

    it('should handle errors when creating a semester', async () => {
      vi.mocked(semesterService.create).mockRejectedValue(new Error('Invalid data'));

      const response = await request(app)
        .post('/semesters')
        .send({ userId: 'user123', semester: {} });

      expect(response.status).not.toBe(201);
    });
  });

  describe('PUT /:id', () => {
    it('should update a semester', async () => {
      const updatedSemester = { name: 'Updated Fall 2023' };
      const resultSemester = { id: '1', name: 'Updated Fall 2023' };
      vi.mocked(semesterService.update).mockResolvedValue(resultSemester);

      const response = await request(app)
        .put('/semesters/1')
        .send({ userId: 'user123', semester: updatedSemester });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Semester updated');
      expect(response.body.updatedSemester).toEqual(resultSemester);
      expect(semesterService.update).toHaveBeenCalledWith('1', 'user123', updatedSemester);
    });

    it('should handle errors when updating a semester', async () => {
      vi.mocked(semesterService.update).mockRejectedValue(new Error('Not found'));

      const response = await request(app)
        .put('/semesters/999')
        .send({ userId: 'user123', semester: { name: 'Test' } });

      expect(response.status).not.toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a semester', async () => {
      const deletedSemester = { id: '1', name: 'Fall 2023' };
      vi.mocked(semesterService.delete).mockResolvedValue({ semester: deletedSemester });

      const response = await request(app).delete('/semesters/1').send({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Semester deleted.');
      expect(response.body.semester).toEqual(deletedSemester);
      expect(semesterService.delete).toHaveBeenCalledWith('1', 'user123');
    });

    it('should handle errors when deleting a semester', async () => {
      vi.mocked(semesterService.delete).mockRejectedValue(new Error('Not found'));

      const response = await request(app).delete('/semesters/999').send({ userId: 'user123' });

      expect(response.status).not.toBe(200);
    });
  });
});
