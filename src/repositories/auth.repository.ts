import prisma from "@prisma.client";

class AuthRepository {
  async getAll() {
    return await prisma.user.findMany();
  }

  async getById(id: String) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getUniqueByUsername(username: String) {
    return await prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async getUniqueByEmail(email: String) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async getUniqueByIdentifier(identifier: String) {
    return await prisma.user.findUnique({
      where: identifier,
    });
  }

  async create(
    name: String,
    email: String,
    username: String,
    password: String
  ) {
    return await prisma.user.create({
      data: {
        name,
        email,
        username,
        password,
      },
    });
  }

  async delete(id: String) {
    return await prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

export default new AuthRepository();
