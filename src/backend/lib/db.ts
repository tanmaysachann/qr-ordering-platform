import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL!;

  if (url.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: url });
  }

  // pg doesn't support channel_binding — strip it to avoid connection issues
  const cleanUrl = url.replace(/[?&]channel_binding=[^&]*/g, "").replace(/\?$/, "");

  // Reuse the pool across hot reloads to avoid stale connection errors (P1017)
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
