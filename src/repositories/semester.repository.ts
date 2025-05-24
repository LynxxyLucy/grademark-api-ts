import prisma from "@prisma.client";
import subjectRepo from "./subject.repository";
import { UUID } from "crypto";

class SemesterRepository {
  async getManyBySearch(search: String, userId: UUID) {
    return await prisma.semester.findMany({
      where: {
        semester: { contains: search }, // Find semesters that contain the string
        userId,
      },
    });
  }

  async getManyForUser(userId: UUID) {
    return await prisma.semester.findMany({
      where: {
        userId,
      },
    });
  }

  async getUnique(id: UUID) {
    return await prisma.semester.findUnique({
      where: {
        id,
      },
    });
  }

  async getUniqueWithSubjects(id: UUID) {
    try {
      const semester = await this.getUnique(id);
      const subjects = await subjectRepo.getAllForSemester(id);
      semester.subjects = subjects;
      return semester;
    } catch {
      return null;
    }
  }

  async create(userId: UUID, semester: String) {
    return await prisma.semester.create({
      data: {
        semester: semester.toString(), // Convert semester to string
        userId,
      },
    });
  }

  async update(id: UUID, userId: UUID, semester: String) {
    return await prisma.semester.update({
      where: {
        id,
        userId,
      },
      data: {
        semester,
      },
    });
  }

  async delete(id: UUID, userId: UUID) {
    return await prisma.semester.delete({
      where: {
        id,
        userId,
      },
    });
  }
}

export default new SemesterRepository();
