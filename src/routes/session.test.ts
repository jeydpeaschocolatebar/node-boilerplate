import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import session from 'express-session';
import request from 'supertest';

vi.mock('../db/index', () => ({
    prisma: {
        user: { findUnique: vi.fn() }
    }
}));

import { prisma } from '../db/index';
import { errorHandler } from '../middlewares/errorHandler';
import { notFound } from '../middlewares/notFound';
import sessionRouter from './session';

const app = express();
app.use(express.json());
app.use(
    session({
        store: new session.MemoryStore(),
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    })
);
app.use('/api/auth/session', sessionRouter);
app.use(notFound);
app.use(errorHandler);

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

describe('POST /api/auth/session/login', () => {
    it('returns 400 for invalid body', async () => {
        const res = await request(app)
            .post('/api/auth/session/login')
            .send({ email: 'not-an-email' });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 when user not found', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/session/login')
            .send({ email: 'no@user.com', password: 'password123' });
        expect(res.status).toBe(401);
        expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 for wrong password', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
        const res = await request(app)
            .post('/api/auth/session/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    it('returns 200 and sets cookie on valid credentials', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
        const res = await request(app)
            .post('/api/auth/session/login')
            .send({ email: 'test@example.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({ id: 'user-1', email: 'test@example.com' });
        expect(res.headers['set-cookie']).toBeDefined();
    });
});

describe('GET /api/auth/session/me', () => {
    it('returns 401 without session cookie', async () => {
        const res = await request(app).get('/api/auth/session/me');
        expect(res.status).toBe(401);
    });

    it('returns 200 with user data when authenticated', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

        const agent = request.agent(app);
        await agent
            .post('/api/auth/session/login')
            .send({ email: 'test@example.com', password: 'password123' });

        const res = await agent.get('/api/auth/session/me');
        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ id: 'user-1', email: 'test@example.com' });
    });
});

describe('POST /api/auth/session/logout', () => {
    it('returns 200 and clears cookie when authenticated', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

        const agent = request.agent(app);
        await agent
            .post('/api/auth/session/login')
            .send({ email: 'test@example.com', password: 'password123' });

        const res = await agent.post('/api/auth/session/logout');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('returns 401 on /me after logout', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

        const agent = request.agent(app);
        await agent
            .post('/api/auth/session/login')
            .send({ email: 'test@example.com', password: 'password123' });
        await agent.post('/api/auth/session/logout');

        const res = await agent.get('/api/auth/session/me');
        expect(res.status).toBe(401);
    });
});
