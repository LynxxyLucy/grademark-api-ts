import express from 'express';
import service from '@root/src/services/1.semester.service';

const router = express.Router();

// Get all semesters of a user
router.get('/', async (req, res, next) => {
  const { userId } = req.body; // Get userId from query parameters
  const { search } = req.query; // Get semester from query parameters

  try {
    
    const semesters = await service.getAllForUser(userId, search as string);
    res.status(200).json(semesters); // Send the semesters in the response
  } catch (error) {
    next(error);
  }
});

// Get a specific semester by id
router.get('/:id', async (req, res, next) => {
  const { id } = req.params; // Get semesterId from request parameters

  try {
    const semester = await service.getUniqueByIdWithSubjects(id);
    res.status(200).json(semester); // Send the semester in the response
  } catch (error) {
    next(error);
  }
});

// Create a new semester for a user
router.post('/', async (req, res, next) => {
  const { userId, semester } = req.body; // Get userId and semester from request body

  try {
    const newSemester = await service.create(userId, semester);
    res.status(201).json({ message: 'Semester created.', newSemester }); // Send the new semester in the response
  } catch (error) {
    next(error);
  }
});

// Update a semester for a user
router.put('/:id', async (req, res, next) => {
  const { id } = req.params; // Get semesterId from request parameters
  const { userId } = req.body; // Get userId from request body
  const { semester } = req.body; // Get semester from request body

  try {
    const updatedSemester = await service.update(id, userId, semester);
    res.status(200).json({ message: 'Semester updated', updatedSemester }); // Send the updated semester in the response
  } catch (error) {
    next(error);
  }
});

// Delete a semester for a user
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params; // Get semesterId from request parameters
  const { userId } = req.body; // Get userId from query parameters

  try {
    const toDelete = await service.delete(id, userId);
    res.status(200).json({ message: 'Semester deleted.', semester: toDelete.semester }); // Send the deleted subject in the response
  } catch (error) {
    next(error);
  }
});

export default router;
