import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/index', () => ({
    prisma: {
        refreshToken: {
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
            deleteMany: vi.fn()
        }
    }
}));

import { prisma } from '../db/index';
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    rotateRefreshToken,
    deleteRefreshToken
} from './auth.service';
import { AppError } from '../middlewares/errorHandler';

beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-secret-for-unit-tests';
    vi.clearAllMocks();
});

describe('hashPassword / comparePassword', () => {
    it('hashes and verifies a password', async () => {
        const hash = await hashPassword('mypassword123');
        expect(hash).not.toBe('mypassword123');
        expect(await comparePassword('mypassword123', hash)).toBe(true);
    });

    it('returns false for wrong password', async () => {
        const hash = await hashPassword('correct');
        expect(await comparePassword('wrong', hash)).toBe(false);
    });
});

describe('generateAccessToken / verifyAccessToken', () => {
    it('generates a verifiable token', () => {
        const payload = { id: 'user-1', email: 'a@b.com' };
        const token = generateAccessToken(payload);
        const decoded = verifyAccessToken(token);
        expect(decoded.id).toBe('user-1');
        expect(decoded.email).toBe('a@b.com');
    });

    it('throws AppError(401) for invalid token', () => {
        expect(() => verifyAccessToken('not.a.token')).toThrowError(AppError);
    });
});

describe('generateRefreshToken', () => {
    it('returns a 128-char hex string', () => {
        const token = generateRefreshToken();
        expect(token).toHaveLength(128);
        expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('generates unique tokens', () => {
        expect(generateRefreshToken()).not.toBe(generateRefreshToken());
    });
});

describe('saveRefreshToken', () => {
    it('creates a token record in DB', async () => {
        vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);
        await saveRefreshToken('user-1', 'token-abc');
        expect(prisma.refreshToken.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ token: 'token-abc', userId: 'user-1' })
            })
        );
    });
});

describe('rotateRefreshToken', () => {
    it('throws AppError(401) when token not found', async () => {
        vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);
        await expect(rotateRefreshToken('bad-token')).rejects.toThrowError(AppError);
    });

    it('throws AppError(401) when token expired', async () => {
        vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
            id: '1',
            token: 'old',
            userId: 'u1',
            expiresAt: new Date('2000-01-01'),
            createdAt: new Date(),
            user: {
                id: 'u1',
                email: 'a@b.com',
                passwordHash: 'x',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        } as never);
        vi.mocked(prisma.refreshToken.delete).mockResolvedValue({} as never);
        await expect(rotateRefreshToken('old')).rejects.toThrowError(AppError);
    });
});

describe('deleteRefreshToken', () => {
    it('calls deleteMany with the token', async () => {
        vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 });
        await deleteRefreshToken('some-token');
        expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
            where: { token: 'some-token' }
        });
    });
});
