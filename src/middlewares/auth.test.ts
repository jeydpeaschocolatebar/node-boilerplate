import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-secret-for-unit-tests';
    vi.resetModules();
});

import { generateAccessToken } from '../services/auth.service';
import { requireAuth, optionalAuth } from './auth';
import { AppError } from './errorHandler';

function makeReq(token?: string): Request {
    return {
        headers: token ? { authorization: `Bearer ${token}` } : {}
    } as unknown as Request;
}

const res = {} as Response;

describe('requireAuth', () => {
    it('attaches req.user for valid token', () => {
        const token = generateAccessToken({ id: 'u1', email: 'a@b.com' });
        const req = makeReq(token);
        const next = vi.fn() as unknown as NextFunction;

        requireAuth(req, res, next);

        expect(req.user).toEqual(expect.objectContaining({ id: 'u1', email: 'a@b.com' }));
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });

    it('calls next(AppError 401) when no token', () => {
        const req = makeReq();
        const next = vi.fn() as unknown as NextFunction;

        requireAuth(req, res, next);

        const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(401);
    });

    it('calls next(AppError 401) for invalid token', () => {
        const req = makeReq('invalid.token.here');
        const next = vi.fn() as unknown as NextFunction;

        requireAuth(req, res, next);

        const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(401);
    });
});

describe('optionalAuth', () => {
    it('attaches req.user when token is valid', () => {
        const token = generateAccessToken({ id: 'u2', email: 'b@c.com' });
        const req = makeReq(token);
        const next = vi.fn() as unknown as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user?.id).toBe('u2');
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });

    it('continues without user when no token', () => {
        const req = makeReq();
        const next = vi.fn() as unknown as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user).toBeUndefined();
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });

    it('continues without user when token is invalid', () => {
        const req = makeReq('bad-token');
        const next = vi.fn() as unknown as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user).toBeUndefined();
        expect((next as ReturnType<typeof vi.fn>).mock.calls[0]).toHaveLength(0);
    });
});
