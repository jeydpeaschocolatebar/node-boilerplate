import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { validate } from './validate';
import { AppError } from './errorHandler';

function makeReq(body: unknown, query?: unknown, params?: unknown): Request {
    return { body, query: query ?? {}, params: params ?? {} } as unknown as Request;
}

const res = {} as Response;

describe('validate middleware', () => {
    it('passes valid body through and calls next', () => {
        const schema = z.object({ name: z.string() });
        const next = vi.fn() as unknown as NextFunction;
        const req = makeReq({ name: 'Alice' });

        validate({ body: schema })(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(req.body).toEqual({ name: 'Alice' });
    });

    it('calls next with AppError(400) on invalid body', () => {
        const schema = z.object({ age: z.number() });
        const next = vi.fn() as unknown as NextFunction;
        const req = makeReq({ age: 'not-a-number' });

        validate({ body: schema })(req, res, next);

        const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('VALIDATION_ERROR');
    });

    it('validates query params', () => {
        const schema = z.object({ page: z.string() });
        const next = vi.fn() as unknown as NextFunction;
        const req = makeReq({}, { page: '1' });

        validate({ query: schema })(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });
});
