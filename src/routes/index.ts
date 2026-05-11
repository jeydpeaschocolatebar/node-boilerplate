import { Router } from 'express';

import { getExample } from '../controllers';
import healthRouter from './health';

const router: Router = Router();

// ── Health ───────────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Example ──────────────────────────────────────────────────────────────────
router.get('/example', getExample);

// ── Add resource routes here ─────────────────────────────────────────────────
// import userRouter from './user';
// router.use('/users', userRouter);

export default router;
