import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

function createClient(): PrismaClient {
  const client = new PrismaClient();
  const url = process.env.DATABASE_URL ?? "";
  return /^(prisma|prisma\+postgres):/.test(url)
    ? client.$extends(withAccelerate()) as unknown as PrismaClient
    : client;
}
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
// Construction is lazy with respect to database connections, including at build time.
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
