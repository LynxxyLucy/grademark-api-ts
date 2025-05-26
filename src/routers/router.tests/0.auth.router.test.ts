import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../0.auth.router';
import service from '../../services/0.auth.service';
import { ConflictError, InvalidError, NotFoundError, ServerError } from '../../utils/custom.error';
import { errorHandler } from '../../middleware/error.middleware';

// Mock the auth service
vi.mock('../../services/0.auth.service', () => ({
  default: {
    validateInput: vi.fn(),
    registerUser: vi.fn(),
    findAllUsers: vi.fn(),
    loginUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use(errorHandler);

describe('Auth Router', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return all users with 200 status', async () => {
      const mockUsers = [
        { id: '1', name: 'User1', email: 'user1@test.com', username: 'user1' },
        { id: '2', name: 'User2', email: 'user2@test.com', username: 'user2' },
      ];

      vi.mocked(service.findAllUsers).mockResolvedValue(mockUsers);

      const response = await request(app).get('/auth/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(service.findAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on server error', async () => {
      vi.mocked(service.findAllUsers).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/auth/');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /register', () => {
    it('should register a new user with 201 status', async () => {
      const created = Date.now();
      const updated = Date.now();

      const newUser = {
        name: 'Test User',
        email: '1234@test.com',
        username: '12345',
        password: 'password123',
      };

      const mockResult = {
        token: 'Test Token',
        user: {
          name: 'Test User',
          id: 'Test-Id',
          email: '1234@test.com',
          username: '12345',
          password: 'password123',
          createdAt: created,
          updatedAt: updated,
        },
      };

      vi.mocked(service.validateInput).mockReturnValue(newUser);
      vi.mocked(service.registerUser).mockResolvedValue(mockResult);

      const response = await request(app).post('/auth/register').send(newUser);

      expect(response.status).toBe(201);
      console.log(response);
      expect(response.body).toHaveProperty('message', 'New user created.');
      expect(response.body).toHaveProperty('newUser', mockResult);
      expect(service.registerUser).toHaveBeenCalledWith(
        newUser.name,
        newUser.email,
        newUser.username,
        newUser.password,
      );
    });

    it('should return 418 on validation error', async () => {
      const invalidUser = {
        name: 'Test',
        email: 'invalid-email',
        username: 'test',
        password: '123',
      };

      // Mock the validation to throw an InvalidError
      vi.mocked(service.validateInput).mockImplementation(() => {
        throw new InvalidError('Validation failed');
      });

      const response = await request(app).post('/auth/register').send(invalidUser);

      expect(service.validateInput).toHaveBeenCalledTimes(1);
      expect(service.validateInput).toHaveBeenCalledWith({ ...invalidUser });
      console.log(response);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.status).toBe(418);
    });

    it('should return 409 on conflict error', async () => {
      const duplicateUser = {
        name: 'Test User',
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      vi.mocked(service.validateInput).mockReturnValue(duplicateUser);
      vi.mocked(service.registerUser).mockRejectedValue(new ConflictError('User already exists.'));

      const response = await request(app).post('/auth/register').send(duplicateUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'User already exists.');
    });

    it('should return 500 on server error', async () => {
      const newUser = {
        name: 'Test User2',
        email: 'test2@test.com',
        username: 'testuser2',
        password: 'password1234',
      };

      vi.mocked(service.validateInput).mockReturnValue(newUser);
      vi.mocked(service.registerUser).mockRejectedValue(new ServerError('Database error'));

      const response = await request(app).post('/auth/register').send(newUser);

      console.log(response.body);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('POST /login', () => {
    it('should login user successfully with 200 status', async () => {
      const loginData = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      const mockResult = {
        user: { id: '123', username: 'testuser', email: 'test@test.com' },
        token: 'jwt-token-here',
      };

      vi.mocked(service.loginUser).mockResolvedValue(mockResult);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login succesful!');
      expect(response.body).toHaveProperty('login', mockResult);
      expect(service.loginUser).toHaveBeenCalledWith(
        loginData.email,
        loginData.username,
        loginData.password,
      );
    });

    it('should return 418 on invalid credentials', async () => {
      const invalidLogin = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'wrongpassword',
      };

      vi.mocked(service.loginUser).mockRejectedValue(new InvalidError('Invalid credentials'));

      const response = await request(app).post('/auth/login').send(invalidLogin);

      expect(response.status).toBe(418);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 500 on server error', async () => {
      const loginData = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      vi.mocked(service.loginUser).mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('DELETE /delete/:id', () => {
    it('should delete user successfully with 200 status', async () => {
      const userId = '123';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@test.com',
      };

      vi.mocked(service.deleteUser).mockResolvedValue(mockUser);

      const response = await request(app).delete(`/auth/delete/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', `User '${mockUser.username}' deleted.`);
      expect(service.deleteUser).toHaveBeenCalledWith(userId);
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = 'non-existent';

      vi.mocked(service.deleteUser).mockRejectedValue(new NotFoundError('User not found'));

      const response = await request(app).delete(`/auth/delete/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 on server error', async () => {
      const userId = '123';

      vi.mocked(service.deleteUser).mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete(`/auth/delete/${userId}`);

      expect(response.status).toBe(500);
      // expect(response.body).toHaveProperty('message', 'Database error');
    });
  });
});
