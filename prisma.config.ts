import path from "node:path";
import type { PrismaConfig } from "prisma";
import "dotenv/config";

export default {
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: "prisma/migrations",
  },
  earlyAccess: true,
} satisfies PrismaConfig;