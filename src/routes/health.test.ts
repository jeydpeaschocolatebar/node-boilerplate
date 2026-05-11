import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';

import healthRouter from './health';

const app = express();
app.use('/api/health', healthRouter);

describe('GET /api/health', () => {
    it('returns 200 with health payload', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
            status: 'ok',
            env: expect.any(String),
            uptime: expect.any(Number),
            timestamp: expect.any(String)
        });
    });
});
