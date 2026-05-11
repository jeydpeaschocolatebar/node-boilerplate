import { Router } from 'express';

import {
    sessionLogin,
    sessionLogout,
    sessionMe,
    loginSchema
} from '../controllers/session.controller';
import { requireSessionAuth } from '../middlewares/sessionAuth';
import { validate } from '../middlewares/validate';

const router: Router = Router();

router.post('/login', validate({ body: loginSchema }), sessionLogin);
router.post('/logout', sessionLogout);
router.get('/me', requireSessionAuth, sessionMe);

export default router;
