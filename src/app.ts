import express, { Request, Response } from "express";
import { join } from "path";

const app = express();
const __dirname = __filename;
const staticPath = join(__dirname, "..", "public");

// Middleware
app.use(express.json());

// Health Router
const health = express.Router();
health.get("/", (req: Request, res: Response) => {
  res.status(200).json("Healthy");
});

// App Route Definitions
app.use("/health", health);

export default app;
