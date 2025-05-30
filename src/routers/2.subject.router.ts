import express from 'express';
import service from '@services/2.subject.service';

const router = express.Router();

// Get all subjects of a semester
router.get('/', async (req, res, next) => {
  const { semesterId } = req.body; // Get semesterId from query parameters

  try {
    const subjects = await service.getAllForSemester(semesterId);
    res.status(200).json(subjects); // Send the subjects in the response
  } catch (error) {
    next(error);
  }
});

// Get a specific subject by id
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const subject = await service.getUniqueByIdWithGrades(id);
    res.status(200).json(subject); // Send the subject in the response
  } catch (error) {
    next(error);
  }
});

// Create a new subject for a year
router.post('/', async (req, res, next) => {
  const { semesterId, name } = req.body; // Get semesterId and subject from request body

  try {
    const newSubject = await service.create(name, semesterId);
    res.status(201).json({ message: 'Subject created.', newSubject }); // Send the new subject in the response
  } catch (error) {
    next(error);
  }
});

// Update a specific subject by id
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedSubject = await service.update(id, name);
    res.status(200).json({ message: 'Subject updated.', updatedSubject }); // Send the updated subject in the response
  } catch (error) {
    next(error);
  }
});

// Delete a specific subject by id
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedSubject = await service.delete(id);
    res.status(200).json({ message: 'Subject deleted.', subject: deletedSubject.name }); // Send the deleted subject in the response
  } catch (error) {
    next(error);
  }
});

export default router;
