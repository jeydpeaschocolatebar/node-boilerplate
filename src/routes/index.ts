import { Router } from 'express';

import { getExample } from '../controllers';
import authRouter from './auth';
import healthRouter from './health';

const router: Router = Router();

// ── Health ───────────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Auth ─────────────────────────────────────────────────────────────────────
router.use('/auth', authRouter);

// ── Example ──────────────────────────────────────────────────────────────────
router.get('/example', getExample);

// ── Add resource routes here ─────────────────────────────────────────────────
// import userRouter from './user';
// router.use('/users', userRouter);

export default router;
