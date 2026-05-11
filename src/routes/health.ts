import { Request, Response, Router } from 'express';

import { successResponse } from '../utils/response';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json(
        successResponse(
            {
                status: 'ok',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                env: process.env.NODE_ENV ?? 'development'
            },
            'Service is healthy'
        )
    );
});

export default router;
