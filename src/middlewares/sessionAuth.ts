import { NextFunction, Request, Response } from 'express';

import { AppError } from './errorHandler';

export function requireSessionAuth(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session.user) {
        return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
    }
    req.user = req.session.user;
    next();
}

export function optionalSessionAuth(req: Request, _res: Response, next: NextFunction): void {
    if (req.session.user) {
        req.user = req.session.user;
    }
    next();
}
