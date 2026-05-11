import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../db/index';
import {
    comparePassword,
    deleteRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    rotateRefreshToken,
    saveRefreshToken
} from '../services/auth.service';
import { AppError } from '../middlewares/errorHandler';
import { successResponse } from '../utils/response';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1)
});

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body as z.infer<typeof loginSchema>;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

        const valid = await comparePassword(password, user.passwordHash);
        if (!valid) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = generateRefreshToken();
        await saveRefreshToken(user.id, refreshToken);

        res.status(200).json(
            successResponse({ accessToken, refreshToken, expiresIn: 900 }, 'Login successful')
        );
    } catch (err) {
        next(err);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
        const tokens = await rotateRefreshToken(refreshToken);
        res.status(200).json(successResponse({ ...tokens, expiresIn: 900 }, 'Token refreshed'));
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
        await deleteRefreshToken(refreshToken);
        res.status(200).json(successResponse(null, 'Logged out'));
    } catch (err) {
        next(err);
    }
}
