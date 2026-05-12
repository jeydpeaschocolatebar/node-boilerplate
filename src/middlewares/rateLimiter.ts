import rateLimit from 'express-rate-limit';

const GENERAL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const GENERAL_MAX = Number(process.env.RATE_LIMIT_MAX) || 100;
const AUTH_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const AUTH_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;

const limitMessage = (msg: string) => ({
    success: false,
    message: msg,
    code: 'RATE_LIMIT_EXCEEDED'
});

export const generalLimiter = rateLimit({
    windowMs: GENERAL_WINDOW_MS,
    max: GENERAL_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: limitMessage('Too many requests')
});

export const authLimiter = rateLimit({
    windowMs: AUTH_WINDOW_MS,
    max: AUTH_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: limitMessage('Too many auth attempts')
});
