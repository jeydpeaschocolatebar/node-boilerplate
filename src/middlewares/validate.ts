import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

import { AppError } from './errorHandler';

interface ValidateTarget {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

export function validate(schemas: ValidateTarget) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schemas.body) req.body = schemas.body.parse(req.body);
            if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
            if (schemas.params) req.params = schemas.params.parse(req.params);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const message = err.errors
                    .map((e) => `${e.path.join('.')}: ${e.message}`)
                    .join(', ');
                next(new AppError(400, message, 'VALIDATION_ERROR'));
            } else {
                next(err);
            }
        }
    };
}
