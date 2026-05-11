import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../services/auth.service';
import { AppError } from './errorHandler';

function extractBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return header.slice(7);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
    const token = extractBearerToken(req);
    if (!token) {
        next(new AppError(401, 'Authorization header missing or malformed', 'UNAUTHORIZED'));
        return;
    }
    try {
        req.user = verifyAccessToken(token);
        next();
    } catch (err) {
        next(err);
    }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const token = extractBearerToken(req);
    if (token) {
        try {
            req.user = verifyAccessToken(token);
        } catch {
            // token present but invalid — continue without user
        }
    }
    next();
}
