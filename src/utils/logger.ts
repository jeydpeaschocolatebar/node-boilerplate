// Minimal logger — swap console for pino or winston without touching call sites.
// Usage: import { logger } from '../utils/logger';
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: unknown): void {
    const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(meta !== undefined && { meta })
    };
    if (level === 'error') {
        console.error(JSON.stringify(entry));
    } else {
        console.log(JSON.stringify(entry));
    }
}

export const logger = {
    info: (message: string, meta?: unknown) => log('info', message, meta),
    warn: (message: string, meta?: unknown) => log('warn', message, meta),
    error: (message: string, meta?: unknown) => log('error', message, meta),
    debug: (message: string, meta?: unknown) => log('debug', message, meta)
};
