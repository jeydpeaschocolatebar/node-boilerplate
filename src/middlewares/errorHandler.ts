import { NextFunction, Request, Response } from 'express';

import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json(errorResponse(err.message, err.code));
        return;
    }

    logger.error('Unhandled error', { message: err.message, stack: err.stack });
    res.status(500).json(errorResponse('Internal server error', 'INTERNAL_ERROR'));
}
