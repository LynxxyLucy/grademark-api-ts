import prisma from "@prisma.client";
import { UUID } from "crypto";

class GradeRepository {
  async getAllForSubject(subjectId: UUID) {
    return await prisma.grade.findMany({
      where: {
        subjectId,
      },
    });
  }

  async checkSubjectExistance(subjectId: UUID) {
    return await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
    });
  }

  async create(subjectId: UUID, grade: String, type: String, date: String ) {
    return await prisma.grade.create({
      data: {
        subjectId,
        grade,
        type,
        date,
      },
    });
  }

  async update(id: UUID, grade: String, type: String, date: String) {
    return await prisma.grade.update({
      where: {
        id,
      },
      data: {
        grade,
        type,
        date,
      },
    });
  }

  async delete(id: String) {
    return await prisma.grade.delete({
      where: {
        id,
      },
    });
  }
}

export default new GradeRepository();
