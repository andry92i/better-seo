import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("prisma://") && !url.startsWith("prisma+postgres://")) {
    throw new Error(
      'DATABASE_URL must be a Prisma Accelerate URL (prisma:// or prisma+postgres://). Direct PostgreSQL URLs are not supported with engineType = "client".',
    );
  }
  return new PrismaClient().$extends(withAccelerate());
};

type DbClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: DbClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
