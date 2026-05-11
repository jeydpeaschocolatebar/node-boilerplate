import { Request, Response } from 'express';

import { errorResponse } from '../utils/response';

export function notFound(req: Request, res: Response): void {
    res.status(404).json(
        errorResponse(`Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND')
    );
}
