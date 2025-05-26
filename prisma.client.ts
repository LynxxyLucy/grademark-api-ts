import { PrismaClient } from "@generated/prisma/client";

// const prisma = new PrismaClient();
const prisma = new PrismaClient({log:["query", "info", "error"]});

export default prisma;