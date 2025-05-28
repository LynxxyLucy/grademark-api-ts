import express from 'express';
import service from '@services/3.grade.service';

const router = express.Router();

// Get all grades for a subject BY ID (query)
router.get('/', async (req, res, next) => {
  const { subjectId } = req.query; // Get subjectId from query parameters

  try {
    // const grades = await service.getAllGrades();
    const grades = await service.getAllForSubject(subjectId as string); // Fetch all grades from the repository
    res.status(200).json(grades); // Send the grades in the response
  } catch (error) {
    next(error);
  }
});

// Get all grades of a subject BY ID (parameter)
router.get('/:subjectId', async (req, res, next) => {
  const { subjectId } = req.params;

  try {
    //const grades = await service.getAllGradesForSubject(subjectId);
    const grades = await service.getAllForSubject(subjectId);
    res.status(200).json(grades); // Send the grades in the response
  } catch (error) {
    next(error);
  }
});

// Create a new grade for a subject
router.post('/', async (req, res, next) => {
  const { subjectId, grade, type, date } = req.body; // Get subjectId, name, and value from request body

  try {
    const newGrade = await service.create(subjectId, grade, type, date);
    res.status(201).json({ message: 'Grade created.', newGrade }); // Send the new grade in the response
  } catch (error) {
    next(error);
  }
});

// Update a specific grade by id
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { grade, type, date } = req.body; // Get name and value from request body

  console.log(req.body); // Log the request body for debugging

  try {
    const updatedGrade = await service.update(id, grade, type, date);
    res.status(200).json({ message: 'Grade updated.', updatedGrade }); // Send the updated grade in the response
  } catch (error) {
    next(error);
  }
});

// Delete a specific grade by id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedGrade = await service.delete(id);
    res.status(200).json({ message: 'Grade deleted.', deletedGrade }); // Send the success message in the response
  } catch (error) {
    next(error);
  }
});

export default router;
