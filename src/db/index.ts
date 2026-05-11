// Generated Prisma client lives in /generated/prisma after `prisma generate`.
// Swap the import path if you change the generator output in schema.prisma.
import { PrismaClient } from '../../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export async function connectDB(): Promise<void> {
    await prisma.$connect();
}

export async function disconnectDB(): Promise<void> {
    await prisma.$disconnect();
}
