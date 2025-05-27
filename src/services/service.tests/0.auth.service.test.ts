import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authService from '../0.auth.service';
import repo from '../../repositories/0.auth.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ConflictError, InvalidError, NotFoundError } from '../../utils/custom.error';

// Mock dependencies
vi.mock('../../repositories/0.auth.repository', () => ({
  default: {
    getAll: vi.fn(),
    getUniqueByUsername: vi.fn(),
    getUniqueByEmail: vi.fn(),
    create: vi.fn(),
    getFirstByIdentifier: vi.fn(),
    getById: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hashSync: vi.fn(),
    compareSync: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mock-token'),
  },
}));

describe('AuthService', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateInput', () => {
    it('should validate user input and return value', () => {
      const validInput = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const result = authService.validateInput(validInput);
      expect(result).toEqual(validInput);
    });

    it('should throw InvalidError for invalid input', () => {
      const invalidInput = { name: 'Test User' }; // Missing required fields
      expect(() => authService.validateInput(invalidInput)).toThrow(InvalidError);
    });

    it('should throw InvalidError for empty input', () => {
      const emptyInput = {};
      expect(() => authService.validateInput(emptyInput)).toThrow(InvalidError);
    });
    
    it('should throw InvalidError for input with empty fields', () => {
      const emptyFieldsInput = {
        name: '',
        email: '',
        username: '',
        password: '',
      };
      expect(() => authService.validateInput(emptyFieldsInput)).toThrow(InvalidError);
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser];
      vi.mocked(repo.getAll).mockResolvedValue(mockUsers);

      const result = await authService.findAllUsers();

      expect(repo.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });

    it('should handle repository errors', async () => {
      vi.mocked(repo.getAll).mockRejectedValue(new Error('Database error'));
      await expect(authService.findAllUsers()).rejects.toThrow('Database error');
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      vi.mocked(repo.getUniqueByUsername).mockResolvedValue(null);
      vi.mocked(repo.getUniqueByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hashSync).mockReturnValue('hashedpassword');
      vi.mocked(repo.create).mockResolvedValue(mockUser);
      vi.mocked(jwt.sign).mockImplementation(() => 'mock-token');

      const result = await authService.registerUser(
        'Test User',
        'test@example.com',
        'testuser',
        'password123',
      );

      expect(repo.getUniqueByUsername).toHaveBeenCalledWith('testuser');
      expect(repo.getUniqueByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({ token: 'mock-token', user: mockUser });
    });

    it('should throw ConflictError if username already exists', async () => {
      vi.mocked(repo.getUniqueByUsername).mockResolvedValue(mockUser);

      await expect(
        authService.registerUser('Test User', 'test@example.com', 'testuser', 'password123'),
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if email already exists', async () => {
      vi.mocked(repo.getUniqueByUsername).mockResolvedValue(null);
      vi.mocked(repo.getUniqueByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.registerUser('Test User', 'test@example.com', 'testuser', 'password123'),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('loginUser', () => {
    it('should login successfully with email', async () => {
      vi.mocked(repo.getFirstByIdentifier).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true);
      vi.mocked(jwt.sign).mockImplementation(() => 'mock-token');

      const result = await authService.loginUser('test@example.com', '', 'password123');

      expect(repo.getFirstByIdentifier).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result.token).toBe('mock-token');
      expect(result.user).toHaveProperty('id', '1');
    });

    it('should login successfully with username', async () => {
      vi.mocked(repo.getFirstByIdentifier).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(true);
      vi.mocked(jwt.sign).mockImplementation(() => 'mock-token');

      const result = await authService.loginUser('', 'testuser', 'password123');

      expect(repo.getFirstByIdentifier).toHaveBeenCalledWith('testuser');
      expect(result.token).toBe('mock-token');
    });

    it('should throw InvalidError if user not found', async () => {
      vi.mocked(repo.getFirstByIdentifier).mockResolvedValue(null);

      await expect(authService.loginUser('', 'nonexistent', 'password123')).rejects.toThrow(
        InvalidError,
      );
    });

    it('should throw InvalidError if password is invalid', async () => {
      vi.mocked(repo.getFirstByIdentifier).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compareSync).mockReturnValue(false);

      await expect(authService.loginUser('', 'testuser', 'wrongpassword')).rejects.toThrow(
        InvalidError,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      vi.mocked(repo.getById).mockResolvedValue(mockUser);

      const result = await authService.deleteUser('1');

      expect(repo.getById).toHaveBeenCalledWith('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      vi.mocked(repo.getById).mockResolvedValue(null);

      await expect(authService.deleteUser('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('Helper methods', () => {
    it('should hash a password correctly', () => {
      vi.mocked(bcrypt.hashSync).mockReturnValue('hashedpassword');
      const result = authService.hashPass('password123');
      expect(result).toBe('hashedpassword');
    });

    it('should validate password correctly', () => {
      vi.mocked(bcrypt.compareSync).mockReturnValue(true);
      const result = authService.validatePass('password123', mockUser);
      expect(result).toBe(true);
    });

    it('should generate a token correctly', () => {
      const result = authService.generateToken('1');
      expect(result).toBe('mock-token');
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      process.env.JWT_SECRET = undefined;
      vi.mocked(jwt.sign).mockImplementation(() => {
        throw new Error('JWT_SECRET is not defined');
      });
      expect(() => authService.generateToken('1')).toThrow();
    });
  });
});
