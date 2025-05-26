import { ConflictError, NotFoundError, ServerError } from '../utils/custom.error';
import repo from '../repositories/1.semester.repository';

class SemesterService {
  async getAllForUser(userId: string, search?: string) {
    let semesters = {};

    if (search) {
      semesters = await repo.getManyBySearch(search as string, userId);
      if (!semesters || Object.keys(semesters).length === 0) {
        throw new NotFoundError('No semesters found for this user or this search term.');
      }
    } else {
      semesters = await repo.getManyForUser(userId);
      if (!semesters || Object.keys(semesters).length === 0) {
        throw new NotFoundError('No semesters found for this user.');
      }
    }

    return semesters;
  }

  async getUniqueByIdWithSubjects(id: string) {
    const semester = await repo.getUniqueWithSubjects(id);
    if (!semester || Object.keys(semester).length <= 1) {
      throw new NotFoundError('Semester not found.');
    }
    return semester;
  }

  async create(userId: string, semester: string) {
    const checkSemester = await repo.getUniqueByName(semester, userId);
    if (checkSemester) {
      throw new ConflictError('Semester already exists for this user.');
    }

    const newSemester = await repo.create(userId, semester);
    if (!newSemester) {
      throw new ServerError('Failed to create semester.');
    }

    return newSemester;
  }

  async update(id: string, userId: string, semester: string) {
    const checkSemester = await repo.getUnique(id);
    if (!checkSemester) {
      throw new NotFoundError('Semester not found.');
    }

    const updatedSemester = await repo.update(id, userId, semester);
    if (!updatedSemester) {
      throw new ServerError('Failed to update semester.');
    }

    return updatedSemester;
  }

  async delete(id: string, userId: string) {
    const toDelete = await repo.getUnique(id);
    if (!toDelete) {
      throw new NotFoundError('Semester not found.');
    }

    const deletedSemester = await repo.delete(id, userId);
    if (!deletedSemester) {
      throw new ServerError('Failed to delete semester.');
    }

    return toDelete;
  }

}

export default new SemesterService();
