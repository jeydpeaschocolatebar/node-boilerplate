import { CorsOptions } from 'cors';

export function buildCorsOrigins(): CorsOptions['origin'] {
    const raw = process.env.CORS_ORIGIN?.trim();
    if (!raw) return process.env.NODE_ENV === 'production' ? false : '*';
    const origins = raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    return origins.length === 1 ? origins[0] : origins;
}
