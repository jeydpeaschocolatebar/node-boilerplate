import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { requireSessionAuth, optionalSessionAuth } from './sessionAuth';
import { AppError } from './errorHandler';

function makeReq(sessionUser?: { id: string; email: string }): Request {
    return {
        session: { user: sessionUser },
        user: undefined
    } as unknown as Request;
}

const res = {} as Response;

describe('requireSessionAuth', () => {
    it('attaches req.user and calls next() when session.user exists', () => {
        const req = makeReq({ id: 'u1', email: 'a@b.com' });
        const next = vi.fn() as unknown as NextFunction;

        requireSessionAuth(req, res, next);

        expect(req.user).toEqual({ id: 'u1', email: 'a@b.com' });
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });

    it('calls next(AppError 401) when no session.user', () => {
        const req = makeReq();
        const next = vi.fn() as unknown as NextFunction;

        requireSessionAuth(req, res, next);

        const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('UNAUTHORIZED');
    });
});

describe('optionalSessionAuth', () => {
    it('attaches req.user when session.user is present', () => {
        const req = makeReq({ id: 'u2', email: 'b@c.com' });
        const next = vi.fn() as unknown as NextFunction;

        optionalSessionAuth(req, res, next);

        expect(req.user).toEqual({ id: 'u2', email: 'b@c.com' });
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });

    it('continues without req.user when no session.user', () => {
        const req = makeReq();
        const next = vi.fn() as unknown as NextFunction;

        optionalSessionAuth(req, res, next);

        expect(req.user).toBeUndefined();
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });
});
