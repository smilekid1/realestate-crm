import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  if (!process.env.TURSO_DATABASE_URL) {
    // Local development — use SQLite file
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const path = require("path");
    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) });
  }

  // Production — use Turso cloud database
  const { PrismaLibSql } = require("@prisma/adapter-libsql");
  return new PrismaClient({
    adapter: new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN ?? "",
    }),
  });
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
