import { Router } from 'express';

import { login, loginSchema, logout, refresh, refreshSchema } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';

const router: Router = Router();

router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', validate({ body: refreshSchema }), refresh);
router.post('/logout', validate({ body: refreshSchema }), logout);

export default router;
