import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../db/index', () => ({
    prisma: {
        user: { findUnique: vi.fn() },
        refreshToken: {
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
            deleteMany: vi.fn()
        }
    }
}));

import { prisma } from '../db/index';
import { errorHandler } from '../middlewares/errorHandler';
import { notFound } from '../middlewares/notFound';
import authRouter from './auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(notFound);
app.use(errorHandler);

beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-secret-for-unit-tests';
    vi.clearAllMocks();
});

const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    // bcrypt hash of "password123"
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQbSVtFS',
    createdAt: new Date(),
    updatedAt: new Date()
};

describe('POST /api/auth/login', () => {
    it('returns 400 for invalid body', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 when user not found', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'no@user.com', password: 'password123' });
        expect(res.status).toBe(401);
        expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 for wrong password', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });
});

describe('POST /api/auth/refresh', () => {
    it('returns 400 for missing refreshToken', async () => {
        const res = await request(app).post('/api/auth/refresh').send({});
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 for unknown token', async () => {
        vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'unknown-token' });
        expect(res.status).toBe(401);
    });
});

describe('POST /api/auth/logout', () => {
    it('returns 200 and deletes token', async () => {
        vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 });
        const res = await request(app)
            .post('/api/auth/logout')
            .send({ refreshToken: 'some-token' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(prisma.refreshToken.deleteMany).toHaveBeenCalled();
    });

    it('returns 400 for missing refreshToken', async () => {
        const res = await request(app).post('/api/auth/logout').send({});
        expect(res.status).toBe(400);
    });
});
