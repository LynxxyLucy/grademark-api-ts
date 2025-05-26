import { describe, it, expect, vi, beforeEach } from 'vitest';
import gradeRepository from '../3.grade.repository';
import prisma from '../../../prisma.client';

// Mock the prisma client
vi.mock('../../../prisma.client', () => {
  return {
    default: {
      grade: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      subject: {
        findUnique: vi.fn(),
      },
    },
  };
});

describe('GradeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllForSubject', () => {
    it('should return all grades for a subject', async () => {
      const mockGrades = [
        { id: '1', subjectId: 'subject1', grade: 'A', type: 'exam', date: '2023-01-01' },
        { id: '2', subjectId: 'subject1', grade: 'B', type: 'quiz', date: '2023-01-15' },
      ];

      vi.mocked(prisma.grade.findMany).mockResolvedValue(mockGrades);

      const result = await gradeRepository.getAllForSubject('subject1');

      expect(prisma.grade.findMany).toHaveBeenCalledWith({
        where: { subjectId: 'subject1' },
      });
      expect(result).toEqual(mockGrades);
    });

    it('should return an empty array when no grades are found', async () => {
      vi.mocked(prisma.grade.findMany).mockResolvedValue([]);

      const result = await gradeRepository.getAllForSubject('nonexistentSubject');

      expect(prisma.grade.findMany).toHaveBeenCalledWith({
        where: { subjectId: 'nonexistentSubject' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('checkSubjectExistance', () => {
    it('should return a subject if it exists', async () => {
      const mockSubject = { id: 'subject1', name: 'Math' };

      vi.mocked(prisma.subject.findUnique).mockResolvedValue(mockSubject);

      const result = await gradeRepository.checkSubjectExistance('subject1');

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 'subject1' },
      });
      expect(result).toEqual(mockSubject);
    });

    it('should return null if subject does not exist', async () => {
      vi.mocked(prisma.subject.findUnique).mockResolvedValue(null);

      const result = await gradeRepository.checkSubjectExistance('nonexistent');

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new grade', async () => {
      const mockDate = new Date();

      const mockGrade = {
        id: '1',
        subjectId: 'subject1',
        grade: 'A',
        type: 'exam',
        date: mockDate,
      };

      vi.mocked(prisma.grade.create).mockResolvedValue(mockGrade);

      const result = await gradeRepository.create('subject1', 'A', 'exam', mockDate);

      expect(prisma.grade.create).toHaveBeenCalledWith({
        data: {
          subjectId: 'subject1',
          grade: 'A',
          type: 'exam',
          date: mockDate,
        },
      });
      expect(result).toEqual(mockGrade);
    });
  });

  describe('update', () => {
    it('should update an existing grade', async () => {
      const mockDate = new Date();

      const mockUpdatedGrade = {
        id: '1',
        subjectId: 'subject1',
        grade: 'B',
        type: 'quiz',
        date: mockDate,
      };

      vi.mocked(prisma.grade.update).mockResolvedValue(mockUpdatedGrade);

      const result = await gradeRepository.update('1', 'B', 'quiz', mockDate);

      expect(prisma.grade.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          grade: 'B',
          type: 'quiz',
          date: mockDate,
        },
      });
      expect(result).toEqual(mockUpdatedGrade);
    });
  });

  describe('delete', () => {
    it('should delete a grade', async () => {
      const mockDeletedGrade = {
        id: '1',
        subjectId: 'subject1',
        grade: 'A',
        type: 'exam',
        date: '2023-01-01',
      };

      vi.mocked(prisma.grade.delete).mockResolvedValue(mockDeletedGrade);

      const result = await gradeRepository.delete('1');

      expect(prisma.grade.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockDeletedGrade);
    });
  });
});
