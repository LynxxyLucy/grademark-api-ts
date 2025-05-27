import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import gradeService from '../3.grade.service';
import repo from '../../repositories/3.grade.repository';
import { NotFoundError, ServerError } from '../../utils/custom.error';

// Mock the repository
vi.mock('../../repositories/3.grade.repository', () => ({
    default: {
        getAllForSubject: vi.fn(),
        create: vi.fn(),
        getById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Grade Service', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllForSubject', () => {
        it('should return grades when they exist for a subject', async () => {
            const mockGrades = [{ id: '1', grade: 'A', type: 'test', date: new Date() }];
            vi.mocked(repo.getAllForSubject).mockResolvedValue(mockGrades);

            const result = await gradeService.getAllForSubject('subject1');
            expect(result).toEqual(mockGrades);
            expect(repo.getAllForSubject).toHaveBeenCalledWith('subject1');
        });

        it('should throw NotFoundError when no grades exist for a subject', async () => {
            vi.mocked(repo.getAllForSubject).mockResolvedValue([]);

            await expect(gradeService.getAllForSubject('subject1')).rejects.toThrow(NotFoundError);
            expect(repo.getAllForSubject).toHaveBeenCalledWith('subject1');
        });
    });

    describe('create', () => {
        it('should create and return a new grade', async () => {
            const mockDate = new Date();
            const mockGrade = { id: '1', subjectId: 'subject1', grade: 'A', type: 'test', date: mockDate };
            vi.mocked(repo.create).mockResolvedValue(mockGrade);

            const result = await gradeService.create('subject1', 'A', 'test', mockDate);
            expect(result).toEqual(mockGrade);
            expect(repo.create).toHaveBeenCalledWith('subject1', 'A', 'test', mockDate);
        });

        it('should throw ServerError when creation fails', async () => {
            const mockDate = new Date();
            vi.mocked(repo.create).mockResolvedValue(null);

            await expect(gradeService.create('subject1', 'A', 'test', mockDate)).rejects.toThrow(ServerError);
            expect(repo.create).toHaveBeenCalledWith('subject1', 'A', 'test', mockDate);
        });
    });

    describe('update', () => {
        it('should update and return the grade when it exists', async () => {
            const mockDate = new Date();
            const mockGrade = { id: '1', grade: 'B', type: 'quiz', date: mockDate };
            vi.mocked(repo.getById).mockResolvedValue(mockGrade);
            vi.mocked(repo.update).mockResolvedValue({ ...mockGrade, grade: 'A' });

            const result = await gradeService.update('1', 'A', 'quiz', mockDate);
            expect(result).toEqual({ ...mockGrade, grade: 'A' });
            expect(repo.getById).toHaveBeenCalledWith('1');
            expect(repo.update).toHaveBeenCalledWith('1', 'A', 'quiz', mockDate);
        });

        it('should throw NotFoundError when grade does not exist', async () => {
            const mockDate = new Date();
            vi.mocked(repo.getById).mockResolvedValue(null);

            await expect(gradeService.update('1', 'A', 'test', mockDate)).rejects.toThrow(NotFoundError);
            expect(repo.getById).toHaveBeenCalledWith('1');
            expect(repo.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete and return the grade when it exists', async () => {
            const mockGrade = { id: '1', grade: 'A', type: 'test', date: new Date() };
            vi.mocked(repo.getById).mockResolvedValue(mockGrade);
            vi.mocked(repo.delete).mockResolvedValue(mockGrade);

            const result = await gradeService.delete('1');
            expect(result).toEqual(mockGrade);
            expect(repo.getById).toHaveBeenCalledWith('1');
            expect(repo.delete).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundError when grade does not exist', async () => {
            vi.mocked(repo.getById).mockResolvedValue(null);

            await expect(gradeService.delete('1')).rejects.toThrow(NotFoundError);
            expect(repo.getById).toHaveBeenCalledWith('1');
            expect(repo.delete).not.toHaveBeenCalled();
        });
    });
});