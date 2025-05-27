import express from 'express';
import service from '@root/src/services/0.auth.service';

const router = express.Router();

// MARK: FIND ALL
router.get('/', async (req, res, next) => {
  try {
    const allUsers = await service.findAllUsers();
    res.status(200).json(allUsers);
  } catch (error) {
    next(error);
  }
});

// MARK:  REGISTER
router.post('/register', async (req, res, next) => {
  console.log('Request body:', req.body); // Log the request body

  try {
    // Validate Input
    const v = service.validateInput(req.body);
    const newUser = await service.registerUser(v.name, v.email, v.username, v.password);
    res.status(201).json({ message: 'New user created.', newUser });
  } catch (error) {
    next(error);
  }
});

// MARK:  LOGIN
router.post('/login', async (req, res, next) => {
  // Destructure request body
  const { email, username, password } = req.body;

  try {
    const login = await service.loginUser(email, username, password);
    res.status(200).json({ message: 'Login succesful!', login });
  } catch (error) {
    next(error);
  }
});

// MARK:  DELETE
router.delete('/delete/:id', async (req, res, next) => {
  const { id } = req.params; // Get userId from request parameters

  try {
    // Delete the user
    const toDelete = await service.deleteUser(id);
    res.status(200).json({ message: `User '${toDelete.username}' deleted.` }); // No Content
  } catch (error) {
    next(error);
  }
});

export default router;
