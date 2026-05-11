import { describe, it, expect } from 'vitest';

import { successResponse, errorResponse } from './response';

describe('successResponse', () => {
    it('returns success shape with data', () => {
        const result = successResponse({ id: 1 }, 'Created');
        expect(result).toEqual({ success: true, message: 'Created', data: { id: 1 } });
    });

    it('defaults message to OK', () => {
        const result = successResponse(null);
        expect(result.message).toBe('OK');
    });
});

describe('errorResponse', () => {
    it('returns error shape with code', () => {
        const result = errorResponse('Bad request', 'VALIDATION_ERROR');
        expect(result).toEqual({
            success: false,
            message: 'Bad request',
            code: 'VALIDATION_ERROR'
        });
    });

    it('omits code when not provided', () => {
        const result = errorResponse('Something went wrong');
        expect(result).not.toHaveProperty('code');
    });
});
