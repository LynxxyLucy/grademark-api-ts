import prisma from "@prisma.client";

class GradeRepository {
  async getAllForSubject(subjectId: string) {
    return await prisma.grade.findMany({
      where: {
        subjectId,
      },
    });
  }

  async checkSubjectExistance(subjectId: string) {
    return await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
    });
  }

  async create(subjectId: string, grade: string, type: string, date: Date ) {
    return await prisma.grade.create({
      data: {
        subjectId,
        grade,
        type,
        date,
      },
    });
  }

  async update(id: string, grade: string, type: string, date: string) {
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

  async delete(id: string) {
    return await prisma.grade.delete({
      where: {
        id,
      },
    });
  }
}

export default new GradeRepository();
