import { PrismaClient } from '@prisma/client';
import { env } from './env';

// ─────────────────────────────────────────────
//  Prisma Client — Singleton
// ─────────────────────────────────────────────
//  In development, Next.js/ts-node-dev can reload modules which
//  creates multiple PrismaClient instances. We cache the instance
//  on globalThis to prevent this in non-production environments.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
