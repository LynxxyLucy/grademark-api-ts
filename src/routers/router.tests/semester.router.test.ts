import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';
import request from 'supertest';
import express from 'express';
import semesterRouter from '../../routers/semester.router';
import repo from '../../repositories/semester.repository';
import { errorHandler } from '../../middleware/error.middleware';

// Mock the repository
vi.mock('@repositories/semester.repository', () => ({
  default: {
    getManyForUser: vi.fn(),
    getManyBySearch: vi.fn(),
    getUniqueWithSubjects: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Semester Router', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/semesters', semesterRouter);
    app.use(errorHandler);
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return all semesters for a user', async () => {
      const mockSemesters = [{ id: '1', name: 'Spring 2023' }];
      (repo.getManyForUser as unknown as MockInstance).mockResolvedValue(mockSemesters);

      const response = await request(app).get('/semesters').send({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSemesters);
      expect(repo.getManyForUser).toHaveBeenCalledWith('user123');
    });

    it('should return 404 if no semesters found for user', async () => {
      (repo.getManyForUser as unknown as MockInstance).mockResolvedValue(null);

      const response = await request(app).get('/semesters').send({ userId: 'user123' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'No semesters found.' });
    });

    it('should search for semesters if search parameter is provided', async () => {
      const mockSemesters = [{ id: '1', name: 'Spring 2023' }];
      (repo.getManyBySearch as unknown as MockInstance).mockResolvedValue(mockSemesters);

      const response = await request(app)
        .get('/semesters?search=Spring')
        .send({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSemesters);
      expect(repo.getManyBySearch).toHaveBeenCalledWith('Spring', 'user123');
    });

    it('should handle errors', async () => {
      (repo.getManyForUser as unknown as MockInstance).mockRejectedValue(
        new Error('Database error'),
      );

      await request(app).get('/semesters').send({ userId: 'user123' });

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return a specific semester by id', async () => {
      const mockSemester = { id: '1', name: 'Spring 2023', subjects: [] };
      (repo.getUniqueWithSubjects as unknown as MockInstance).mockResolvedValue(mockSemester);

      const response = await request(app).get('/semesters/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSemester);
      expect(repo.getUniqueWithSubjects).toHaveBeenCalledWith('1');
    });

    it('should return 404 if semester not found', async () => {
      (repo.getUniqueWithSubjects as unknown as MockInstance).mockResolvedValue(null);

      const response = await request(app).get('/semesters/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Semester not found.' });
    });
  });

  describe('POST /', () => {
    it('should create a new semester', async () => {
      const semesterData = { name: 'Spring 2023' };
      const mockNewSemester = { id: '1', ...semesterData };

      (repo.create as unknown as MockInstance).mockResolvedValue(mockNewSemester);

      const response = await request(app)
        .post('/semesters')
        .send({ userId: 'user123', semester: semesterData });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Semester created.',
        newSemester: mockNewSemester,
      });
      expect(repo.create).toHaveBeenCalledWith('user123', semesterData);
    });
  });

  describe('PUT /:id', () => {
    it('should update a semester', async () => {
      const semesterData = { name: 'Updated Spring 2023' };
      const mockUpdatedSemester = { id: '1', ...semesterData };

      (repo.update as unknown as MockInstance).mockResolvedValue(mockUpdatedSemester);

      const response = await request(app)
        .put('/semesters/1')
        .send({ userId: 'user123', semester: semesterData });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Semester updated',
        updatedSemester: mockUpdatedSemester,
      });
      expect(repo.update).toHaveBeenCalledWith('1', 'user123', semesterData);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a semester', async () => {
      const mockDeletedSemester = { id: '1', name: 'Spring 2023' };

      (repo.delete as unknown as MockInstance).mockResolvedValue(mockDeletedSemester);

      const response = await request(app).delete('/semesters/1').send({ userId: 'user123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Semester deleted.',
        deletedSemester: mockDeletedSemester,
      });
      expect(repo.delete).toHaveBeenCalledWith('1', 'user123');
    });
  });
});
