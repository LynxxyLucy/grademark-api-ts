import prisma from "@prisma.client"
import gradeRepo from "./grade.repository";
import { UUID } from "crypto";

class SubjectRepository {
  async getAllForSemester(semesterId: UUID) {
    return await prisma.subject.findMany({
      where: {
        semesterId,
      },
    });
  }

  async getUnique(id: UUID) {
    return await prisma.subject.findUnique({
      where: {
        id,
      },
    });
  }

  async getUniqueWithGrades(id: UUID ) {
    try {
      const subject = await this.getUnique(id);
      const grades = await gradeRepo.getAllForSubject(id);
      subject.grades = grades;
      return subject;
    } catch {
      return null;
    }
  }

  async createNew(name: String, semesterId: UUID) {
    return await prisma.subject.create({
      data: {
        name,
        semesterId,
      },
    });
  }

  async update(id: UUID, name: String) {
    return await prisma.subject.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  async delete(id: String) {
    return await prisma.subject.delete({
      where: {
        id,
      },
    });
  }
}

export default new SubjectRepository();
