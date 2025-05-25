import express, { Request, Response } from "express";
import service from "@services/auth.service";
import {
  ConflictError,
  InvalidError,
  NotFoundError,
} from "@utils/custom.error";
import { userSchema } from "@utils/joi.schemas";

const router = express.Router();

// MARK: FIND ALL
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const allUsers = await service.findAllUsers();
    return res.status(200).json(allUsers);
  } catch (e: any) {
    console.log(e.message);
    return res.status(500).json({ error: e.message });
  }
});

// MARK:  REGISTER
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  console.log(req.body);

  try {
    // Validate Input
    const { error: e, value: v } = userSchema.validate(req.body);
    if (e) {
      throw new InvalidError(e.message);
    }

    const newUser = await service.registerUser(
      v.name,
      v.email,
      v.username,
      v.password
    );
    return res.status(201).json({ message: "New user created.", newUser });
  } catch (error: any) {
    console.log(error);
    if (error instanceof ConflictError) {
      return res.status(400).json({ message: error.message });
    } else if (error instanceof InvalidError) {
      return res.status(400).json({ message: error.message})
    }
    return res.status(500).json({ message: error.message }); // Internal Server Error
  }
});

// MARK:  LOGIN
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  // Destructure request body
  const { email, username, password } = req.body;

  try {
    const login = await service.loginUser(email, username, password);
    return res.status(200).json({ message: "Login succesful!", login });
  } catch (error: any) {
    console.log(error.message);
    if (error instanceof InvalidError) {
      return res.status(400).json({ message: error.message }); // Bad Request
    }
    return res.status(500).json({ message: error.message }); // Internal Server Error
  }
});

// MARK:  DELETE
router.delete(
  "/delete/:id",
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params; // Get userId from request parameters

    try {
      // Delete the user
      const toDelete = await service.deleteUser(id);
      res.status(200).json({ message: `User '${toDelete.username}' deleted.` }); // No Content
    } catch (error: any) {
      console.log(error.message);
      if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message }); // Internal Server Error
    }
  }
);

export default router;
