import prisma from "@prisma.client";
import { User } from "@generated/prisma";
import { NotFoundError } from "../utils/custom.error";

class AuthRepository {
  async getAll(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  async getById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getUniqueByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async getUniqueByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async getFirstByIdentifier(identifier: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        // Assuming identifier could be either email or username
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async create(
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    return await prisma.user.create({
      data: {
        name,
        email,
        username,
        password,
      },
    });
  }

  async delete(id: string) : Promise<void> {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

export default new AuthRepository();
