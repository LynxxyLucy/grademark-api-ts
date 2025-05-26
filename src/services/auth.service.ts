import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import repo from '@root/src/repositories/auth.repository';
import { ConflictError, InvalidError, NotFoundError } from '@utils/custom.error';
import { User } from '@generated/prisma';
import { userSchema } from '../utils/joi.schemas';

class AuthService {
  validateInput(data: unknown) {
    const { error: e, value: v } = userSchema.validate(data);
    if (e) {
      throw new InvalidError(e.message);
    }
    return v;
  }

  // MARK: FIND ALL USERS
  async findAllUsers(): Promise<User[]> {
    const users = await repo.getAll();
    if (!users || users.length === 0) {
      throw new NotFoundError('No users found.');
    }
    return users;
  }

  // MARK:  REGISTER USER
  async registerUser(name: string, email: string, username: string, password: string) {
    // Check if the user already exists
    const findUsername = await repo.getUniqueByUsername(username);
    const findEmail = await repo.getUniqueByEmail(email);
    if (findUsername) {
      throw new ConflictError('Username already registered.'); // Bad Request
    }
    if (findEmail) {
      throw new ConflictError('Email already registered.');
    }

    // Hash the password
    const hashedPassword = this.hashPass(password);

    // Create a new user
    const user = await repo.create(name, email, username, hashedPassword);

    // Generate a JWT token
    const token = this.generateToken(user.id);

    // Send the token and user data in the response
    return {
      token,
      user,
    };
  }

  // MARK:  LOGIN USER
  async loginUser(email: string, username: string, password: string) {
    // check if the user exists and validate login
    const identifier = email ? email : username;

    const user = await repo.getFirstByIdentifier(identifier);
    if (!user) {
      throw new InvalidError('Invalid username or password.');
    }

    const isPasswordValid = this.validatePass(password, user);
    if (!isPasswordValid) {
      throw new InvalidError('Invalid username of password.');
    }

    // generate JWT token
    const token = this.generateToken(user.id);

    // return user data
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  // MARK:  DELETE USER
  async deleteUser(id: string) {
    const toDelete = await repo.getById(id);
    if (!toDelete) {
      throw new NotFoundError('User not found!');
    }

    await repo.delete(id);
    return toDelete;
  }

  // MARK: - HELPERS

  hashPass(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  validatePass(password: string, user: User) {
    return bcrypt.compareSync(password, user.password);
  }

  generateToken(userId: string) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ userId }, jwtSecret, {
      expiresIn: '24h',
    });
  }
}

export default new AuthService();
