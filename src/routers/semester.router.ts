import express, { Request, Response } from "express";
import prisma from "@prisma.client";
import repo from "@repositories/semester.repository";

const router = express.Router();

// Get all semesters of a user
router.get("/", async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body; // Get userId from query parameters
  const { search } = req.query; // Get semester from query parameters

  try {
    if (search) {
      const semesters = await repo.getManyBySearch(search as string, userId);
      if (!semesters) {
        return res.status(404).json({ message: "No semesters found." }); // Not Found
      }
      return res.status(200).json(semesters); // Send the semesters in the response
    }

    const semesters = await repo.getManyForUser(userId);
    if (!semesters) {
      return res.status(404).json({ message: "No semesters found." }); // Not Found
    }
    return res.status(200).json(semesters); // Send the semesters in the response
  } catch (error: any) {
    console.log(error.message);
    return res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Get a specific semester by id
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params; // Get semesterId from request parameters

  try {
    const semester = await repo.getUniqueWithSubjects(id);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found." }); // Not Found
    }
    res.status(200).json(semester); // Send the semester in the response
  } catch (error: any) {
    console.log(error.message);
    res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Create a new semester for a user
router.post("/", async (req, res) => {
  const { userId, semester } = req.body; // Get userId and semester from request body

  try {
    const newSemester = await repo.create(userId, semester);
    res.status(201).json({ message: "Semester created.", newSemester }); // Send the new semester in the response
  } catch (error: any) {
    console.log(error.message);
    res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Update a semester for a user
router.put("/:id", async (req, res) => {
  const { id } = req.params; // Get semesterId from request parameters
  const { userId } = req.body; // Get userId from request body
  const { semester } = req.body; // Get semester from request body

  try {
    const updatedSemester = await repo.update(id, userId, semester);
    res.status(200).json({ message: "Semester updated", updatedSemester }); // Send the updated semester in the response
  } catch (error: any) {
    console.log(error.message);
    res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

// Delete a semester for a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params; // Get semesterId from request parameters
  const { userId } = req.body; // Get userId from query parameters

  try {
    const deletedSemester = await repo.delete(id, userId);
    res.status(200).json({ message: "Semester deleted.", deletedSemester }); // Send the deleted subject in the response
  } catch (error: any) {
    console.log(error.message);
    res.sendStatus(500).json({ message: error.message }); // Internal Server Error
  }
});

export default router;
