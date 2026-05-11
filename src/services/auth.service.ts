import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../db/index';
import { AppError } from '../middlewares/errorHandler';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 7);

interface TokenPayload {
    id: string;
    email: string;
}

function getAccessSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
    return secret;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, getAccessSecret(), { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, getAccessSecret()) as TokenPayload;
    } catch {
        throw new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED');
    }
}

export function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
}

export async function rotateRefreshToken(
    oldToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await prisma.refreshToken.findUnique({
        where: { token: oldToken },
        include: { user: true }
    });

    if (!stored || stored.expiresAt < new Date()) {
        if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
        throw new AppError(401, 'Refresh token invalid or expired', 'UNAUTHORIZED');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = generateAccessToken({ id: stored.user.id, email: stored.user.email });
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(stored.user.id, refreshToken);

    return { accessToken, refreshToken };
}

export async function deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
}
