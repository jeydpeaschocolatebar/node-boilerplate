import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

function makeApp(max: number) {
    const app = express();
    const limiter = rateLimit({
        windowMs: 60_000,
        max,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }
    });
    app.use(limiter);
    app.get('/test', (_req, res) => res.json({ ok: true }));
    return app;
}

describe('rate limiter', () => {
    it('allows requests within the limit', async () => {
        const app = makeApp(5);
        const res = await request(app).get('/test');
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });

    it('returns 429 after exceeding max', async () => {
        const app = makeApp(2);
        await request(app).get('/test');
        await request(app).get('/test');
        const res = await request(app).get('/test');
        expect(res.status).toBe(429);
        expect(res.body.success).toBe(false);
        expect(res.body.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('sets RateLimit headers (draft-7)', async () => {
        const app = makeApp(5);
        const res = await request(app).get('/test');
        expect(res.headers['ratelimit']).toBeDefined();
        expect(res.headers['ratelimit-policy']).toBeDefined();
    });
});
