import { PrismaClient } from "@prisma/client";

// Client is generated using whichever schema you ran `prisma generate` with.
// Our npm scripts ensure the right schema per env.
export const prisma = new PrismaClient();
