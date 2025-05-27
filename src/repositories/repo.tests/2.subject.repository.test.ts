import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import prisma from '../../../prisma.client';
import subjectRepository from '../2.subject.repository';
import gradeRepository from '../3.grade.repository';

// Mock the Prisma client and grade repository
vi.mock('../../../prisma.client', () => ({
    default: {
        subject: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('../3.grade.repository', () => ({
    default: {
        getAllForSubject: vi.fn(),
    },
}));

describe('SubjectRepository', () => {
    const mockSubject = {
        id: 'subject-id-1',
        name: 'Mathematics',
        semesterId: 'semester-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockGrades = [
        { id: 'grade-1', value: 90, subjectId: 'subject-id-1' },
        { id: 'grade-2', value: 85, subjectId: 'subject-id-1' },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllForSemester', () => {
        it('should return all subjects for a semester', async () => {
            const mockSubjects = [mockSubject];
            vi.mocked(prisma.subject.findMany).mockResolvedValue(mockSubjects);

            const result = await subjectRepository.getAllForSemester('semester-id-1');

            expect(prisma.subject.findMany).toHaveBeenCalledWith({
                where: { semesterId: 'semester-id-1' },
            });
            expect(result).toEqual(mockSubjects);
        });
    });

    describe('getUnique', () => {
        it('should return a subject by id', async () => {
            vi.mocked(prisma.subject.findUnique).mockResolvedValue(mockSubject);

            const result = await subjectRepository.getUnique('subject-id-1');

            expect(prisma.subject.findUnique).toHaveBeenCalledWith({
                where: { id: 'subject-id-1' },
            });
            expect(result).toEqual(mockSubject);
        });

        it('should return null when subject is not found', async () => {
            vi.mocked(prisma.subject.findUnique).mockResolvedValue(null);

            const result = await subjectRepository.getUnique('non-existent-id');

            expect(prisma.subject.findUnique).toHaveBeenCalledWith({
                where: { id: 'non-existent-id' },
            });
            expect(result).toBeNull();
        });
    });

    describe('getUniqueByName', () => {
        it('should return a subject by name and semesterId', async () => {
            vi.mocked(prisma.subject.findFirst).mockResolvedValue(mockSubject);

            const result = await subjectRepository.getUniqueByName('Mathematics', 'semester-id-1');

            expect(prisma.subject.findFirst).toHaveBeenCalledWith({
                where: { name: 'Mathematics', semesterId: 'semester-id-1' },
            });
            expect(result).toEqual(mockSubject);
        });

        it('should return null when subject is not found', async () => {
            vi.mocked(prisma.subject.findFirst).mockResolvedValue(null);

            const result = await subjectRepository.getUniqueByName('Non-existent Subject', 'semester-id-1');

            expect(prisma.subject.findFirst).toHaveBeenCalledWith({
                where: { name: 'Non-existent Subject', semesterId: 'semester-id-1' },
            });
            expect(result).toBeNull();
        });
    }
    );

    describe('getUniqueWithGrades', () => {
        it('should return subject with grades', async () => {
            vi.mocked(prisma.subject.findUnique).mockResolvedValue(mockSubject);
            vi.mocked(gradeRepository.getAllForSubject).mockResolvedValue(mockGrades);

            const result = await subjectRepository.getUniqueWithGrades('subject-id-1');

            expect(prisma.subject.findUnique).toHaveBeenCalledWith({
                where: { id: 'subject-id-1' },
            });
            expect(gradeRepository.getAllForSubject).toHaveBeenCalledWith('subject-id-1');
            expect(result).toEqual({ ...mockSubject, grades: mockGrades });
        });

        it('should return null when an error occurs', async () => {
            vi.mocked(prisma.subject.findUnique).mockRejectedValue(new Error('Database error'));

            const result = await subjectRepository.getUniqueWithGrades('subject-id-1');

            expect(result).toBeNull();
        });
    });

    describe('createNew', () => {
        it('should create a new subject', async () => {
            vi.mocked(prisma.subject.create).mockResolvedValue(mockSubject);

            const result = await subjectRepository.create('Mathematics', 'semester-id-1');

            expect(prisma.subject.create).toHaveBeenCalledWith({
                data: {
                    name: 'Mathematics',
                    semesterId: 'semester-id-1',
                },
            });
            expect(result).toEqual(mockSubject);
        });
    });

    describe('update', () => {
        it('should update a subject', async () => {
            const updatedSubject = { ...mockSubject, name: 'Advanced Mathematics' };
            vi.mocked(prisma.subject.update).mockResolvedValue(updatedSubject);

            const result = await subjectRepository.update('subject-id-1', 'Advanced Mathematics');

            expect(prisma.subject.update).toHaveBeenCalledWith({
                where: { id: 'subject-id-1' },
                data: { name: 'Advanced Mathematics' },
            });
            expect(result).toEqual(updatedSubject);
        });
    });

    describe('delete', () => {
        it('should delete a subject', async () => {
            vi.mocked(prisma.subject.delete).mockResolvedValue(mockSubject);

            const result = await subjectRepository.delete('subject-id-1');

            expect(prisma.subject.delete).toHaveBeenCalledWith({
                where: { id: 'subject-id-1' },
            });
            expect(result).toEqual(mockSubject);
        });
    });
});