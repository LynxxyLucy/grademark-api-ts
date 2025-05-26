import prisma from "@prisma.client"
import gradeRepo from "./3.grade.repository";

class SubjectRepository {
  async getAllForSemester(semesterId: string) {
    return await prisma.subject.findMany({
      where: {
        semesterId,
      },
    });
  }

  async getUnique(id: string) {
    return await prisma.subject.findUnique({
      where: {
        id,
      },
    });
  }

  async getUniqueWithGrades(id: string ) {
    try {
      const subject = await this.getUnique(id);
      const grades = await gradeRepo.getAllForSubject(id);
      const subj = {...subject, grades: [...grades]}
      return subj;
    } catch {
      return null;
    }
  }

  async create(name: string, semesterId: string) {
    return await prisma.subject.create({
      data: {
        name,
        semesterId,
      },
    });
  }

  async update(id: string, name: string) {
    return await prisma.subject.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  async delete(id: string) {
    return await prisma.subject.delete({
      where: {
        id,
      },
    });
  }
}

export default new SubjectRepository();
