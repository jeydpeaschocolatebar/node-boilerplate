import { Router } from 'express';

import { login, loginSchema, logout, refresh, refreshSchema } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';

const router: Router = Router();

router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', authLimiter, validate({ body: refreshSchema }), refresh);
router.post('/logout', validate({ body: refreshSchema }), logout);

export default router;
