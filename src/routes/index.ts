import { Router } from 'express';

import { getExample } from '../controllers';
import authRouter from './auth';
import healthRouter from './health';
import sessionRouter from './session';

const router: Router = Router();

// ── Health ───────────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Auth ─────────────────────────────────────────────────────────────────────
router.use('/auth', authRouter);
router.use('/auth/session', sessionRouter);

// ── Example ──────────────────────────────────────────────────────────────────
router.get('/example', getExample);

// ── Add resource routes here ─────────────────────────────────────────────────
// import userRouter from './user';
// router.use('/users', userRouter);

export default router;
