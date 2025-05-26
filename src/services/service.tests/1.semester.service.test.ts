import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import semesterService from '../1.semester.service';
import repo from '../../repositories/1.semester.repository';
import { ConflictError, NotFoundError, ServerError } from '../../utils/custom.error';

// Mock the repository
vi.mock('../../repositories/1.semester.repository', () => ({
    default: {
        getManyBySearch: vi.fn(),
        getManyForUser: vi.fn(),
        getUniqueWithSubjects: vi.fn(),
        getUniqueByName: vi.fn(),
        getUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('SemesterService', () => {
    const userId = 'user123';
    const semesterId = 'sem123';
    const semesterName = 'Spring 2023';
    
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllForUser', () => {
        it('should get all semesters for a user', async () => {
            const semesters = { id1: { name: 'Spring 2023' }, id2: { name: 'Fall 2023' } };
            vi.mocked(repo.getManyForUser).mockResolvedValue(semesters);
            
            const result = await semesterService.getAllForUser(userId);
            
            expect(repo.getManyForUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(semesters);
        });

        it('should get semesters by search term', async () => {
            const semesters = { id1: { name: 'Spring 2023' } };
            const search = 'Spring';
            vi.mocked(repo.getManyBySearch).mockResolvedValue(semesters);
            
            const result = await semesterService.getAllForUser(userId, search);
            
            expect(repo.getManyBySearch).toHaveBeenCalledWith(search, userId);
            expect(result).toEqual(semesters);
        });

        it('should throw NotFoundError if no semesters found for user', async () => {
            vi.mocked(repo.getManyForUser).mockResolvedValue({});
            
            await expect(semesterService.getAllForUser(userId))
                .rejects.toThrow(NotFoundError);
            expect(repo.getManyForUser).toHaveBeenCalledWith(userId);
        });

        it('should throw NotFoundError if no semesters found for search term', async () => {
            const search = 'NonExistent';
            vi.mocked(repo.getManyBySearch).mockResolvedValue({});
            
            await expect(semesterService.getAllForUser(userId, search))
                .rejects.toThrow(NotFoundError);
            expect(repo.getManyBySearch).toHaveBeenCalledWith(search, userId);
        });
    });

    describe('getUniqueByIdWithSubjects', () => {
        it('should get semester with subjects by id', async () => {
            const semester = { id: semesterId, name: semesterName, subjects: [] };
            vi.mocked(repo.getUniqueWithSubjects).mockResolvedValue(semester);
            
            const result = await semesterService.getUniqueByIdWithSubjects(semesterId);
            
            expect(repo.getUniqueWithSubjects).toHaveBeenCalledWith(semesterId);
            expect(result).toEqual(semester);
        });

        it('should throw NotFoundError if semester not found', async () => {
            vi.mocked(repo.getUniqueWithSubjects).mockResolvedValue({});
            
            await expect(semesterService.getUniqueByIdWithSubjects(semesterId))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should create a new semester', async () => {
            const newSemester = { id: 'new123', name: semesterName };
            vi.mocked(repo.getUniqueByName).mockResolvedValue(null);
            vi.mocked(repo.create).mockResolvedValue(newSemester);
            
            const result = await semesterService.create(userId, semesterName);
            
            expect(repo.getUniqueByName).toHaveBeenCalledWith(semesterName, userId);
            expect(repo.create).toHaveBeenCalledWith(userId, semesterName);
            expect(result).toEqual(newSemester);
        });

        it('should throw ConflictError if semester already exists', async () => {
            const existingSemester = { id: semesterId, name: semesterName };
            vi.mocked(repo.getUniqueByName).mockResolvedValue(existingSemester);
            
            await expect(semesterService.create(userId, semesterName))
                .rejects.toThrow(ConflictError);
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should throw ServerError if creation fails', async () => {
            vi.mocked(repo.getUniqueByName).mockResolvedValue(null);
            vi.mocked(repo.create).mockResolvedValue(null);
            
            await expect(semesterService.create(userId, semesterName))
                .rejects.toThrow(ServerError);
        });
    });

    describe('update', () => {
        it('should update a semester', async () => {
            const existingSemester = { id: semesterId, name: 'Old Name' };
            const updatedSemester = { id: semesterId, name: semesterName };
            
            vi.mocked(repo.getUnique).mockResolvedValue(existingSemester);
            vi.mocked(repo.update).mockResolvedValue(updatedSemester);
            
            const result = await semesterService.update(semesterId, userId, semesterName);
            
            expect(repo.getUnique).toHaveBeenCalledWith(semesterId);
            expect(repo.update).toHaveBeenCalledWith(semesterId, userId, semesterName);
            expect(result).toEqual(updatedSemester);
        });

        it('should throw NotFoundError if semester not found', async () => {
            vi.mocked(repo.getUnique).mockResolvedValue(null);
            
            await expect(semesterService.update(semesterId, userId, semesterName))
                .rejects.toThrow(NotFoundError);
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should throw ServerError if update fails', async () => {
            const existingSemester = { id: semesterId, name: 'Old Name' };
            
            vi.mocked(repo.getUnique).mockResolvedValue(existingSemester);
            vi.mocked(repo.update).mockResolvedValue(null);
            
            await expect(semesterService.update(semesterId, userId, semesterName))
                .rejects.toThrow(ServerError);
        });
    });

    describe('delete', () => {
        it('should delete a semester', async () => {
            const existingSemester = { id: semesterId, name: semesterName };
            
            vi.mocked(repo.getUnique).mockResolvedValue(existingSemester);
            vi.mocked(repo.delete).mockResolvedValue(existingSemester);
            
            const result = await semesterService.delete(semesterId, userId);
            
            expect(repo.getUnique).toHaveBeenCalledWith(semesterId);
            expect(repo.delete).toHaveBeenCalledWith(semesterId, userId);
            expect(result).toEqual(existingSemester);
        });

        it('should throw NotFoundError if semester not found', async () => {
            vi.mocked(repo.getUnique).mockResolvedValue(null);
            
            await expect(semesterService.delete(semesterId, userId))
                .rejects.toThrow(NotFoundError);
            expect(repo.delete).not.toHaveBeenCalled();
        });

        it('should throw ServerError if deletion fails', async () => {
            const existingSemester = { id: semesterId, name: semesterName };
            
            vi.mocked(repo.getUnique).mockResolvedValue(existingSemester);
            vi.mocked(repo.delete).mockResolvedValue(null);
            
            await expect(semesterService.delete(semesterId, userId))
                .rejects.toThrow(ServerError);
        });
    });
});