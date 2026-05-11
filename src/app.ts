import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';

import routes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach a unique request ID to every response for tracing
app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Request-Id', crypto.randomUUID());
    next();
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;
