import repo from '@root/src/repositories/3.grade.repository';
import { NotFoundError } from '@utils/custom.error';

class GradeService {
  async getAllForSubject(subjectId: string) {
    const grades = await repo.getAllForSubject(subjectId);
    if (!grades || grades.length === 0) {
      throw new NotFoundError('No grades found for this subject.');
    }
    return grades;
  }

  async create(subjectId: string, grade: string, type: string, date: Date) {
    // Create a new grade
    const newGrade = await repo.create(subjectId, grade, type, date);
    return newGrade;
  }

  async update(id: string, grade: string, type: string, date: Date) {
    // Check if the grade exists
    const existingGrade = await repo.getById(id);
    if (!existingGrade) {
      throw new NotFoundError('Grade not found.');
    }

    // Update the grade
    const updatedGrade = await repo.update(id, grade, type, date);
    return updatedGrade;
  }

  async delete(id: string) {
    // Check if the grade exists
    const existingGrade = await repo.getById(id);
    if (!existingGrade) {
      throw new NotFoundError('Grade not found.');
    }

    // Delete the grade
    const deletedGrade = await repo.delete(id);
    return deletedGrade;
  }
}

export default new GradeService();
