import 'express';
import 'express-session';

declare module 'express' {
    interface Request {
        user?: {
            id: string;
            email: string;
        };
    }
}

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string;
            email: string;
        };
    }
}
