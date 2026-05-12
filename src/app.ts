import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import helmet from 'helmet';
import cors from 'cors';

import routes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { generalLimiter } from './middlewares/rateLimiter';
import { buildCorsOrigins } from './utils/cors';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: buildCorsOrigins(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
    })
);
app.use(generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PgStore = PgSession(session);
app.use(
    session({
        store: new PgStore({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true
        }),
        secret: process.env.SESSION_SECRET ?? 'dev-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    })
);

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
