import { PrismaClient } from "@prisma/client";

let _client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (_client) return _client;

  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    _client = new PrismaClient({
      adapter: new PrismaLibSql({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN ?? "",
      }),
    });
  } else {
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const path = require("path");
    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    _client = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbPath }) });
  }

  return _client!;
}

// Lazy proxy — database connection only opens on first actual query
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});
