import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../../../prisma.client";
import semesterRepository from "../semester.repository";
import subjectRepo from "../subject.repository";

// Mock the Prisma client and subject repository
vi.mock("../../../prisma.client", () => ({
  default: {
    semester: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../subject.repository", () => ({
  default: {
    getAllForSemester: vi.fn().mockResolvedValue([]),
  },
}));

describe("SemesterRepository", () => {
  const mockUserId = "user1";
  const mockSemesterId = "sem1";
  const mockSemester = {
    id: mockSemesterId,
    semester: "Fall 2023",
    userId: mockUserId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getManyBySearch", () => {
    it("should return semesters that match the search term", async () => {
      // Arrange
      const searchTerm = "Fall";
      const mockSemesters = [mockSemester];
      prisma.semester.findMany.mockResolvedValue(mockSemesters);

      // Act
      const result = await semesterRepository.getManyBySearch(
        searchTerm,
        mockUserId
      );

      // Assert
      expect(prisma.semester.findMany).toHaveBeenCalledWith({
        where: {
          semester: { contains: searchTerm },
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockSemesters);
    });
  });

  describe("getManyForUser", () => {
    it("should return all semesters for a user", async () => {
      // Arrange
      const mockSemesters = [
        mockSemester,
        { ...mockSemester, id: "sem2", semester: "Spring 2024" },
      ];
      prisma.semester.findMany.mockResolvedValue(mockSemesters);

      // Act
      const result = await semesterRepository.getManyForUser(mockUserId);

      // Assert
      expect(prisma.semester.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockSemesters);
    });
  });

  describe("getUnique", () => {
    it("should return a single semester by id", async () => {
      // Arrange
      prisma.semester.findUnique.mockResolvedValue(mockSemester);

      // Act
      const result = await semesterRepository.getUnique(mockSemesterId);

      // Assert
      expect(prisma.semester.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockSemesterId,
        },
      });
      expect(result).toEqual(mockSemester);
    });
  });

  describe("getUniqueWithSubjects", () => {
    it("should return a semester with its subjects", async () => {
      // Arrange
      const mockSubjects = [
        { id: "sub1", name: "Math" },
        { id: "sub2", name: "Science" },
      ];
      prisma.semester.findUnique.mockResolvedValue(mockSemester);
      vi.mocked(subjectRepo.getAllForSemester).mockResolvedValue(mockSubjects);

      // Act
      const result =
        await semesterRepository.getUniqueWithSubjects(mockSemesterId);

      // Assert
      expect(prisma.semester.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockSemesterId,
        },
      });
      expect(subjectRepo.getAllForSemester).toHaveBeenCalledWith(
        mockSemesterId
      );
      expect(result).toEqual({ ...mockSemester, subjects: mockSubjects });
    });

    it("should return null if an error occurs", async () => {
      // Arrange
      prisma.semester.findUnique.mockRejectedValue(new Error("DB error"));

      // Act
      const result =
        await semesterRepository.getUniqueWithSubjects(mockSemesterId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new semester", async () => {
      // Arrange
      prisma.semester.create.mockResolvedValue(mockSemester);
      const semesterName = "Fall 2023";

      // Act
      const result = await semesterRepository.create(mockUserId, semesterName);

      // Assert
      expect(prisma.semester.create).toHaveBeenCalledWith({
        data: {
          semester: semesterName,
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockSemester);
    });
  });

  describe("update", () => {
    it("should update an existing semester", async () => {
      // Arrange
      const updatedSemester = { ...mockSemester, semester: "Winter 2023" };
      prisma.semester.update.mockResolvedValue(updatedSemester);
      const newSemesterName = "Winter 2023";

      // Act
      const result = await semesterRepository.update(
        mockSemesterId,
        mockUserId,
        newSemesterName
      );

      // Assert
      expect(prisma.semester.update).toHaveBeenCalledWith({
        where: {
          id: mockSemesterId,
          userId: mockUserId,
        },
        data: {
          semester: newSemesterName,
        },
      });
      expect(result).toEqual(updatedSemester);
    });
  });

  describe("delete", () => {
    it("should delete a semester", async () => {
      // Arrange
      prisma.semester.delete.mockResolvedValue(mockSemester);

      // Act
      const result = await semesterRepository.delete(
        mockSemesterId,
        mockUserId
      );

      // Assert
      expect(prisma.semester.delete).toHaveBeenCalledWith({
        where: {
          id: mockSemesterId,
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockSemester);
    });
  });
});
