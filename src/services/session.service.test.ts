import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/index', () => ({
    prisma: {
        user: { findUnique: vi.fn() }
    }
}));

import { prisma } from '../db/index';
import { verifyUserCredentials } from './session.service';
import { AppError } from '../middlewares/errorHandler';

const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    // bcrypt hash of "password123"
    passwordHash: '$2b$12$znO3F6DrJVIj5UA2KUsLj.rVu/yw8NNIArLrNhNbLy7Wc5Gj25MGa',
    createdAt: new Date(),
    updatedAt: new Date()
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('verifyUserCredentials', () => {
    it('returns id and email for valid credentials', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
        const result = await verifyUserCredentials('test@example.com', 'password123');
        expect(result).toEqual({ id: 'user-1', email: 'test@example.com' });
    });

    it('throws AppError 401 when user not found', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        await expect(verifyUserCredentials('no@user.com', 'password123')).rejects.toMatchObject({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS'
        });
    });

    it('throws AppError 401 for wrong password', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
        await expect(
            verifyUserCredentials('test@example.com', 'wrongpassword')
        ).rejects.toMatchObject({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS'
        });
    });

    it('throws AppError instance', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        await expect(verifyUserCredentials('no@user.com', 'password123')).rejects.toBeInstanceOf(
            AppError
        );
    });
});
