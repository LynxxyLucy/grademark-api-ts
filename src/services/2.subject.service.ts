import repo from '@repositories/2.subject.repository';
import { ConflictError, NotFoundError, ServerError } from '../utils/custom.error';

class SubjectService {
  async getAllForSemester(semesterId: string) {
    const subjects = await repo.getAllForSemester(semesterId);
    if (!subjects || subjects.length === 0) {
      throw new NotFoundError('No subjects found for this semester.');
    }
    return subjects;
  }

  async getUniqueByIdWithGrades(id: string) {
    const subject = await repo.getUniqueWithGrades(id);
    if (!subject) {
      throw new NotFoundError('Subject not found.');
    }
    return subject;
  }

  async create(name: string, semesterId: string) {
    const checkSubject = await repo.getUniqueByName(name, semesterId);
    if (checkSubject) {
      throw new ConflictError('Subject with this name already exists for this semester.');
    }
    const newSubject = await repo.create(name, semesterId);
    if (!newSubject) {
      throw new ServerError('Failed to create subject.');
    }
    return newSubject;
  }

  async update(id: string, name: string) {
    const checkSubject = await repo.getUnique(id);
    if (!checkSubject) {
      throw new NotFoundError('Subject not found.');
    }
    const checkName = await repo.getUniqueByName(name, checkSubject.semesterId);
    if (checkName && checkName.id !== id) {
      throw new ConflictError('Subject with this name already exists in this semester.');
    }
    const updatedSubject = await repo.update(id, name);
    if (!updatedSubject) {
      throw new ServerError('Subject not found or failed to update.');
    }
    return updatedSubject;
  }

  async delete(id: string) {
    const toDelete = await repo.getUnique(id);
    if (!toDelete) {
      throw new NotFoundError('Subject not found.');
    }
    const deletedSubject = await repo.delete(id);
    if (!deletedSubject) {
      throw new ServerError('Failed to delete subject.');
    }
    return toDelete;
  }
}

export default new SubjectService();
