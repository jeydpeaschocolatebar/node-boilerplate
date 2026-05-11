import { NextFunction, Request, Response } from 'express';

import { loginSchema } from './auth.controller';
import { verifyUserCredentials } from '../services/session.service';
import { successResponse } from '../utils/response';

export async function sessionLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body as { email: string; password: string };
        const user = await verifyUserCredentials(email, password);

        await new Promise<void>((resolve, reject) => {
            req.session.regenerate((err) => (err ? reject(err) : resolve()));
        });

        req.session.user = user;

        res.status(200).json(successResponse(user, 'Session started'));
    } catch (err) {
        next(err);
    }
}

export async function sessionLogout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await new Promise<void>((resolve, reject) => {
            req.session.destroy((err) => (err ? reject(err) : resolve()));
        });

        res.clearCookie('connect.sid');
        res.status(200).json(successResponse(null, 'Session ended'));
    } catch (err) {
        next(err);
    }
}

export function sessionMe(req: Request, res: Response): void {
    res.status(200).json(successResponse(req.session.user ?? null, 'Session active'));
}

export { loginSchema };
