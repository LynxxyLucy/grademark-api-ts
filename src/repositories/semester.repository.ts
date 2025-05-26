import prisma from '@prisma.client';
import subjectRepo from './subject.repository';

class SemesterRepository {
  async getManyBySearch(search: string, userId: string) {
    return await prisma.semester.findMany({
      where: {
        semester: { contains: search }, // Find semesters that contain the string
        userId,
      },
    });
  }

  async getManyForUser(userId: string) {
    return await prisma.semester.findMany({
      where: {
        userId,
      },
    });
  }

  async getUnique(id: string) {
    return await prisma.semester.findUnique({
      where: {
        id,
      },
    });
  }

  async getUniqueByName(semester: string, userId: string) {
    return await prisma.semester.findUnique({
      where: {
        semester, // Convert semester to string
        userId,
      },
    });
  }

  async getUniqueWithSubjects(id: string) {
    try {
      const semester = await this.getUnique(id);
      const subjects = await subjectRepo.getAllForSemester(id);
      const sem = { ...semester, subjects: [...subjects] };
      return sem;
    } catch {
      return null;
    }
  }

  async create(userId: string, semester: string) {
    return await prisma.semester.create({
      data: {
        semester: semester.toString(), // Convert semester to string
        userId,
      },
    });
  }

  async update(id: string, userId: string, semester: string) {
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

  async delete(id: string, userId: string) {
    return await prisma.semester.delete({
      where: {
        id,
        userId,
      },
    });
  }
}

export default new SemesterRepository();
