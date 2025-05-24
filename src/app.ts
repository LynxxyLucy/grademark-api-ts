import express, { Request, Response } from "express";
import { join } from "path";
import HealthRouter from "@routes/health.router";

const app = express();
const __dirname = __filename;
const staticPath = join(__dirname, "..", "public");

app.use(express.json());

/* app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Healthy");
}); */

app.use("/health", HealthRouter);

export default app;
