# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # run with nodemon + ts-node (watch mode)
pnpm build            # tsc → dist/
pnpm start            # node dist/app.js (requires build first)

pnpm test             # vitest run (all tests)
pnpm test:watch       # vitest watch
pnpm test:coverage    # vitest with v8 coverage

pnpm lint             # eslint src/**/*.ts
pnpm lint:fix         # eslint --fix
pnpm format           # prettier --write

pnpm db:generate      # prisma generate (regenerate client after schema change)
pnpm db:migrate       # prisma migrate dev
pnpm db:studio        # prisma studio GUI
```

Run a single test file:

```bash
pnpm vitest run src/services/auth.service.test.ts
```

## Architecture

**Request flow:** `app.ts` → `routes/index.ts` → route file → `validate()` middleware → controller → service → Prisma

All routes are mounted under `/api`. Route groups: `/api/health`, `/api/auth` (JWT), `/api/auth/session` (session-based).

**Two parallel auth strategies** coexist:

- **JWT** (`middlewares/auth.ts`): `requireAuth` / `optionalAuth` — verifies `Bearer` token via `verifyAccessToken`, attaches `req.user`
- **Session** (`middlewares/sessionAuth.ts`): `requireSessionAuth` / `optionalSessionAuth` — reads `req.session.user`, attaches `req.user`

JWT uses refresh token rotation: opaque random token stored in `RefreshToken` table, swapped atomically on `/api/auth/refresh`. Access tokens expire in 15 min; refresh tokens default 7 days (`JWT_REFRESH_EXPIRES_DAYS`).

Sessions are persisted in PostgreSQL via `connect-pg-simple` (table auto-created). Session secret from `SESSION_SECRET` env var.

**Error handling:** throw `AppError(statusCode, message, code)` anywhere — `errorHandler` middleware catches and serialises it. All responses use `successResponse` / `errorResponse` from `utils/response.ts` (`{ success, message, data?, error?, code? }`).

**Validation:** `validate({ body?, query?, params? })` middleware takes Zod schemas. Schemas are co-located in their controller files and exported alongside the handler.

**Prisma client** lives in `generated/prisma/` (non-standard output path set in `schema.prisma`). Import via `src/db/index.ts` singleton. After any schema change: `pnpm db:generate` then `pnpm db:migrate`.

## Required env vars

```
DATABASE_URL              # PostgreSQL connection string (also used by connect-pg-simple)
JWT_ACCESS_SECRET         # required at runtime; throws if missing
SESSION_SECRET            # falls back to insecure dev default if unset
JWT_REFRESH_EXPIRES_DAYS  # optional, defaults to 7
PORT                      # optional, defaults to 3000
```

SQLite alternative for local dev (no Postgres server needed): set `provider = "sqlite"` in `prisma/schema.prisma` and `DATABASE_URL=file:./dev.db`.

## Prisma models

- `User` — `id` (cuid), `email` (unique), `passwordHash`, timestamps; has many `RefreshToken`
- `RefreshToken` — `id`, `token` (unique opaque hex), `userId` FK (cascade delete), `expiresAt`

## Utilities

- **Logger** (`src/utils/logger.ts`): thin JSON wrapper over `console`. Swap for pino/winston by replacing the implementation — call sites (`logger.info/warn/error/debug`) stay the same.
- **Response helpers** (`src/utils/response.ts`): `successResponse(message, data?)` / `errorResponse(message, code?)` — always use these, never send raw `res.json`.

## Pre-commit hooks

Husky runs lint-staged on commit: eslint + prettier over staged `*.{ts,js,json,md}`. Hooks live in `.husky/`. If a commit is blocked, run `pnpm lint:fix && pnpm format` first.

## TypeScript notes

- `src/types/express.d.ts` augments `Request` (adds `user`) and `SessionData` (adds `user`) — both auth strategies write to the same `req.user` shape.
- Vitest config is `.mts` — required by vitest 4.x; do not rename to `.ts`.
- Tests use `supertest` against the exported `app` from `app.ts`.
