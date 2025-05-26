import express from 'express';
import repo from '@repositories/grade.repository';

const router = express.Router();

// Get all grades of a subject
router.get('/:subjectId', async (req, res, next) => {
  const { subjectId } = req.params;

  try {
    //const grades = await service.getAllGradesForSubject(subjectId);
    const grades = await repo.getAllForSubject(subjectId);
    res.status(200).json(grades); // Send the grades in the response
  } catch (error) {
    next(error);
    // console.log(error.message);
    // res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Create a new grade for a subject
router.post('/', async (req, res, next) => {
  const { subjectId, grade, type, date } = req.body; // Get subjectId, name, and value from request body

  try {
    const newGrade = await repo.create(subjectId, grade, type, date);
    res.status(201).json({ message: 'Grade created.', newGrade }); // Send the new grade in the response
  } catch (error) {
    next(error);
    // console.log(error.message);
    // res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Update a specific grade by id
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { grade, type, date } = req.body; // Get name and value from request body

  try {
    const updatedGrade = await repo.update(id, grade, type, date);
    res.status(200).json({ message: 'Grade updated.', updatedGrade }); // Send the updated grade in the response
  } catch (error) {
    next(error);
    // console.log(error.message);
    // res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Delete a specific grade by id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedGrade = await repo.delete(id);
    res.status(200).json({ message: 'Grade deleted.', deletedGrade }); // Send the success message in the response
  } catch (error) {
    next(error);
    // console.log(error.message);
    // res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

export default router;
