import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { User } from "../../../generated/prisma";
import authRepository from "../0.auth.repository";
import prisma from "../../../prisma.client";

// Mock the prisma client
vi.mock("../../../prisma.client", () => ({
  default: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe("AuthRepository", () => {
  const mockUser: User = {
    id: "mock-uuid" as string,
    name: "Test User",
    email: "test@example.com",
    username: "testuser",
    password: "password123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getAll", () => {
    it("should return all users", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockUser]);

      const result = await authRepository.getAll();

      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockUser]);
    });
  });

  describe("getById", () => {
    it("should return user by id", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await authRepository.getById(mockUser.id);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUniqueByUsername", () => {
    it("should return user by username", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await authRepository.getUniqueByUsername(
        mockUser.username
      );

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUniqueByEmail", () => {
    it("should return user by email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await authRepository.getUniqueByEmail(mockUser.email);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUniqueByIdentifier", () => {
    it("should return user by identifier", async () => {
      const identifier = "test@example.com";
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);

      const result = await authRepository.getFirstByIdentifier(identifier);

      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: identifier }, { username: identifier }] },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("create", () => {
    it("should create and return a new user", async () => {
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await authRepository.create(
        mockUser.name,
        mockUser.email,
        mockUser.username,
        mockUser.password
      );

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: mockUser.name,
          email: mockUser.email,
          username: mockUser.username,
          password: mockUser.password,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("delete", () => {
    it("should delete a user by id", async () => {
      vi.mocked(prisma.user.delete).mockResolvedValue(mockUser);

      await authRepository.delete(mockUser.id);

      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });
});
