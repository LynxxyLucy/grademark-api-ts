import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import repo from "@repositories/auth.repository";
import {
  ConflictError,
  InvalidError,
  NotFoundError,
} from "@utils/custom.error";
import {User} from "@generated/index"

class AuthService {
  // MARK: FIND ALL USERS
  async findAllUsers() {
    return await repo.getAll();
  }

  // MARK:  REGISTER USER
  async registerUser(name: String, email: String, username: String, password: String) {
    // Check if the user already exists
    const findUsername = await repo.getUniqueByUsername(username);
    const findEmail = await repo.getUniqueByEmail(email);
    if (findUsername) {
      throw new ConflictError("Username already registered."); // Bad Request
    }
    if (findEmail) {
      throw new ConflictError("Email already registered.");
    }

    // Hash the password
    const hashedPassword = this.hashPass(password);

    // Create a new user
    const user = await repo.create(
      name,
      email,
      username,
      hashedPassword,
    );

    // Generate a JWT token
    const token = this.generateToken(user.id);

    // Send the token and user data in the response
    return {
      token,
      user,
    };
  }

  // MARK:  LOGIN USER
  async loginUser(email: String, username: String, password: String) {
    // check if the user exists and validate login
    const identifier = email ? email : username;

    const user = await repo.getUniqueByIdentifier(identifier);
    if (!user) {
      throw new InvalidError("Invalid username or password.");
    }

    const isPasswordValid = this.validatePass(password, user);
    if (!isPasswordValid) {
      throw new InvalidError("Invalid username of password.");
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
  async deleteUser(id) {
    const toDelete = await repo.findById({ id });
    if (!toDelete) {
      throw new NotFoundError("User not found!");
    }

    await repo.delete({ id });
    return toDelete;
  }

  // MARK: - HELPERS
  hashPass(password) {
    return bcrypt.hashSync(password, 16);
  }

  validatePass(password, user) {
    return bcrypt.compareSync(password, user.password);
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  }
}

export default new AuthService();
