import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('buildCorsOrigins', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.CORS_ORIGIN;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    async function load() {
        // Re-import to pick up env changes at module evaluation time
        const mod = await import('./cors?t=' + Date.now());
        return mod.buildCorsOrigins;
    }

    it('returns * in development when CORS_ORIGIN is unset', async () => {
        process.env.NODE_ENV = 'development';
        const buildCorsOrigins = await load();
        expect(buildCorsOrigins()).toBe('*');
    });

    it('returns false in production when CORS_ORIGIN is unset', async () => {
        process.env.NODE_ENV = 'production';
        const buildCorsOrigins = await load();
        expect(buildCorsOrigins()).toBe(false);
    });

    it('returns single string when CORS_ORIGIN has one origin', async () => {
        process.env.CORS_ORIGIN = 'https://app.example.com';
        const buildCorsOrigins = await load();
        expect(buildCorsOrigins()).toBe('https://app.example.com');
    });

    it('returns array when CORS_ORIGIN has multiple origins', async () => {
        process.env.CORS_ORIGIN = 'https://a.com, https://b.com';
        const buildCorsOrigins = await load();
        expect(buildCorsOrigins()).toEqual(['https://a.com', 'https://b.com']);
    });
});
