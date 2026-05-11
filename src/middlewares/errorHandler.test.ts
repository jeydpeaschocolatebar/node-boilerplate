import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { AppError, errorHandler } from './errorHandler';

function mockRes() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    } as unknown as Response;
    return res;
}

const mockReq = {} as Request;
const mockNext = vi.fn() as unknown as NextFunction;

describe('AppError', () => {
    it('sets statusCode and message', () => {
        const err = new AppError(404, 'Not found', 'NOT_FOUND');
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Not found');
        expect(err.code).toBe('NOT_FOUND');
    });
});

describe('errorHandler', () => {
    it('handles AppError with correct status', () => {
        const res = mockRes();
        errorHandler(new AppError(422, 'Unprocessable'), mockReq, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: 'Unprocessable' })
        );
    });

    it('handles unknown errors with 500', () => {
        const res = mockRes();
        errorHandler(new Error('boom'), mockReq, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});
