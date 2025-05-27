import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import subjectService from '../2.subject.service';
import repo from '../../repositories/2.subject.repository';
import { ConflictError, NotFoundError, ServerError } from '../../utils/custom.error';

vi.mock('../../repositories/2.subject.repository');

describe('SubjectService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllForSemester', () => {
        it('should return all subjects for a semester', async () => {
            const mockSubjects = [{ id: '1', name: 'Math', semesterId: 'sem1' }];
            vi.mocked(repo.getAllForSemester).mockResolvedValue(mockSubjects);

            const result = await subjectService.getAllForSemester('sem1');
            
            expect(repo.getAllForSemester).toHaveBeenCalledWith('sem1');
            expect(result).toEqual(mockSubjects);
        });

        it('should throw NotFoundError when no subjects found', async () => {
            vi.mocked(repo.getAllForSemester).mockResolvedValue([]);

            await expect(subjectService.getAllForSemester('sem1')).rejects.toThrow(NotFoundError);
        });
    });

    describe('getUniqueByIdWithGrades', () => {
        it('should return subject with grades by id', async () => {
            const mockSubject = { id: '1', name: 'Math', semesterId: 'sem1', grades: [] };
            vi.mocked(repo.getUniqueWithGrades).mockResolvedValue(mockSubject);

            const result = await subjectService.getUniqueByIdWithGrades('1');
            
            expect(repo.getUniqueWithGrades).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockSubject);
        });

        it('should throw NotFoundError when subject not found', async () => {
            vi.mocked(repo.getUniqueWithGrades).mockResolvedValue(null);

            await expect(subjectService.getUniqueByIdWithGrades('1')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should create a new subject', async () => {
            const mockSubject = { id: '1', name: 'Math', semesterId: 'sem1' };
            vi.mocked(repo.getUniqueByName).mockResolvedValue(null);
            vi.mocked(repo.create).mockResolvedValue(mockSubject);

            const result = await subjectService.create('Math', 'sem1');
            
            expect(repo.getUniqueByName).toHaveBeenCalledWith('Math', 'sem1');
            expect(repo.create).toHaveBeenCalledWith('Math', 'sem1');
            expect(result).toEqual(mockSubject);
        });

        it('should throw ConflictError when subject with same name exists', async () => {
            const existingSubject = { id: '1', name: 'Math', semesterId: 'sem1' };
            vi.mocked(repo.getUniqueByName).mockResolvedValue(existingSubject);
            
            await expect(subjectService.create('Math', 'sem1')).rejects.toThrow(ConflictError);
        });

        it('should throw ServerError when creation fails', async () => {
            vi.mocked(repo.getUniqueByName).mockResolvedValue(null);
            vi.mocked(repo.create).mockResolvedValue(null);
            
            await expect(subjectService.create('Math', 'sem1')).rejects.toThrow(ServerError);
        });
    });

    describe('update', () => {
        it('should update a subject', async () => {
            const existingSubject = { id: '1', name: 'Math', semesterId: 'sem1' };
            const updatedSubject = { id: '1', name: 'Advanced Math', semesterId: 'sem1' };
            vi.mocked(repo.getUnique).mockResolvedValue(existingSubject);
            vi.mocked(repo.getUniqueByName).mockResolvedValue(null);
            vi.mocked(repo.update).mockResolvedValue(updatedSubject);

            const result = await subjectService.update('1', 'Advanced Math');
            
            expect(repo.getUnique).toHaveBeenCalledWith('1');
            expect(repo.getUniqueByName).toHaveBeenCalledWith('Advanced Math', 'sem1');
            expect(repo.update).toHaveBeenCalledWith('1', 'Advanced Math');
            expect(result).toEqual(updatedSubject);
        });

        it('should throw NotFoundError when subject not found', async () => {
            vi.mocked(repo.getUnique).mockResolvedValue(null);
            
            await expect(subjectService.update('1', 'Math')).rejects.toThrow(NotFoundError);
        });

        it('should throw ConflictError when name already exists for different subject', async () => {
            const existingSubject = { id: '1', name: 'Math', semesterId: 'sem1' };
            const anotherSubject = { id: '2', name: 'Advanced Math', semesterId: 'sem1' };
            vi.mocked(repo.getUnique).mockResolvedValue(existingSubject);
            vi.mocked(repo.getUniqueByName).mockResolvedValue(anotherSubject);
            
            await expect(subjectService.update('1', 'Advanced Math')).rejects.toThrow(ConflictError);
        });

        it('should allow update if name exists but belongs to the same subject', async () => {
            const existingSubject = { id: '1', name: 'Math', semesterId: 'sem1' };
            const updatedSubject = { id: '1', name: 'Math Updated', semesterId: 'sem1' };
            vi.mocked(repo.getUnique).mockResolvedValue(existingSubject);
            vi.mocked(repo.getUniqueByName).mockResolvedValue(existingSubject); // Same ID
            vi.mocked(repo.update).mockResolvedValue(updatedSubject);

            const result = await subjectService.update('1', 'Math Updated');
            expect(result).toEqual(updatedSubject);
        });

        it('should throw ServerError when update fails', async () => {
            const existingSubject = { id: '1', name: 'Math', semesterId: 'sem1' };
            vi.mocked(repo.getUnique).mockResolvedValue(existingSubject);
            vi.mocked(repo.getUniqueByName).mockResolvedValue(null);
            vi.mocked(repo.update).mockResolvedValue(null);
            
            await expect(subjectService.update('1', 'Advanced Math')).rejects.toThrow(ServerError);
        });
    });

    describe('delete', () => {
        it('should delete a subject', async () => {
            const subjectToDelete = { id: '1', name: 'Math', semesterId: 'sem1' };
            vi.mocked(repo.getUnique).mockResolvedValue(subjectToDelete);
            vi.mocked(repo.delete).mockResolvedValue(subjectToDelete);

            const result = await subjectService.delete('1');
            
            expect(repo.getUnique).toHaveBeenCalledWith('1');
            expect(repo.delete).toHaveBeenCalledWith('1');
            expect(result).toEqual(subjectToDelete);
        });

        it('should throw NotFoundError when subject not found', async () => {
            vi.mocked(repo.getUnique).mockResolvedValue(null);
            
            await expect(subjectService.delete('1')).rejects.toThrow(NotFoundError);
        });

        it('should throw ServerError when deletion fails', async () => {
            const subjectToDelete = { id: '1', name: 'Math', semesterId: 'sem1' };
            vi.mocked(repo.getUnique).mockResolvedValue(subjectToDelete);
            vi.mocked(repo.delete).mockResolvedValue(null);
            
            await expect(subjectService.delete('1')).rejects.toThrow(ServerError);
        });
    });
});