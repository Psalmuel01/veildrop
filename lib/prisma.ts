import { PrismaClient } from "@prisma/client";

// Next.js dev mode reloads modules on every change, which would otherwise
// spawn a fresh PrismaClient (and a fresh connection pool) on each request.
// Cache it on the global object so hot reloads reuse the same instance.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
