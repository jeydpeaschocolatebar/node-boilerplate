# node-boilerplate

Production-ready Node.js REST API boilerplate — TypeScript, Express 5, Prisma, Zod validation, structured error handling, and Vitest.

## Tech Stack

| Layer      | Library                                     |
| ---------- | ------------------------------------------- |
| Runtime    | Node.js 20+                                 |
| Language   | TypeScript 5 (strict)                       |
| Framework  | Express 5                                   |
| ORM        | Prisma 6 (PostgreSQL default, SQLite-ready) |
| Validation | Zod`                                        |
| Testing    | Vitest + Supertest                          |
| Linting    | ESLint + Prettier                           |
| Git hooks  | Husky + lint-staged                         |

## Prerequisites

- Node.js >= 20.19
- pnpm >= 10
- PostgreSQL (or use SQLite for local dev — see `.env-sample`)

## Setup

```bash
# 1. Clone and install
git clone https://github.com/jeydpeaschocolatebar/node-boilerplate.git
cd node-boilerplate
pnpm install

# 2. Configure environment
cp .env-sample .env
# Edit .env — set DATABASE_URL at minimum

# 3. Generate Prisma client
pnpm db:generate

# 4. Run migrations (requires a live database)
pnpm db:migrate

# 5. Start dev server
pnpm dev
```

Server starts at `http://localhost:4000` (or your `PORT`).

## Scripts

| Script               | Description                               |
| -------------------- | ----------------------------------------- |
| `pnpm dev`           | Start with hot-reload (nodemon + ts-node) |
| `pnpm build`         | Compile TypeScript to `dist/`             |
| `pnpm start`         | Run compiled output                       |
| `pnpm test`          | Run all tests once                        |
| `pnpm test:watch`    | Run tests in watch mode                   |
| `pnpm test:coverage` | Run tests with coverage report            |
| `pnpm lint`          | Lint `src/`                               |
| `pnpm lint:fix`      | Lint and auto-fix                         |
| `pnpm format`        | Format with Prettier                      |
| `pnpm db:generate`   | Generate Prisma client                    |
| `pnpm db:migrate`    | Run database migrations                   |
| `pnpm db:studio`     | Open Prisma Studio                        |

## Project Structure

```text
src/
├── app.ts                  # Express app + server entry point
├── controllers/            # Request handlers (thin — delegate to services)
├── db/
│   └── index.ts            # Prisma singleton + connect/disconnect helpers
├── middlewares/
│   ├── errorHandler.ts     # AppError class + global error middleware
│   ├── notFound.ts         # 404 catch-all
│   └── validate.ts         # Zod validation middleware factory
├── models/                 # Type definitions / domain models
├── routes/
│   ├── health.ts           # GET /api/health
│   └── index.ts            # Route registry
├── services/               # Business logic (called by controllers)
└── utils/
    ├── logger.ts           # Structured logger (swap for pino/winston)
    └── response.ts         # successResponse / errorResponse helpers

prisma/
└── schema.prisma           # Database schema (PostgreSQL default)

generated/
└── prisma/                 # Prisma client output (git-ignored, run db:generate)
```

## API Endpoints

| Method | Path           | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/api/health`  | Service health check |
| GET    | `/api/example` | Example endpoint     |

### Health response

```json
{
    "success": true,
    "message": "Service is healthy",
    "data": {
        "status": "ok",
        "uptime": 12.34,
        "timestamp": "2026-05-11T00:00:00.000Z",
        "env": "development"
    }
}
```

### Standard response envelope

All endpoints return the same shape:

```json
{ "success": true,  "message": "OK",           "data": {} }
{ "success": false, "message": "Bad request",  "code": "VALIDATION_ERROR" }
```

## Adding a Route

1. Create `src/routes/yourResource.ts`
2. Create `src/controllers/yourResource.controller.ts`
3. Create `src/services/yourResource.service.ts`
4. Mount in `src/routes/index.ts`:

```ts
import yourRouter from './yourResource';
router.use('/your-resource', yourRouter);
```

## Validation Example

```ts
import { z } from 'zod';
import { validate } from '../middlewares/validate';

const createUserSchema = z.object({ name: z.string(), email: z.string().email() });

router.post('/users', validate({ body: createUserSchema }), createUser);
```

## Database

Default provider is **PostgreSQL**. To switch to **SQLite** (zero-config local dev):

1. Update `DATABASE_URL` in `.env`: `file:./dev.db`
2. Update `prisma/schema.prisma` datasource provider to `sqlite` (see comment in schema)
3. Run `pnpm db:generate && pnpm db:migrate`

## Auth Roadmap

- [ ] JWT — access + refresh tokens (`/auth/login`, `/auth/refresh`, `/auth/logout`)
- [ ] Auth middleware — `requireAuth`, `optionalAuth`
- [ ] Session-based — server-side sessions with PostgreSQL or Redis store
- [ ] OAuth — Google + GitHub strategy stubs

## License

MIT — [Jade Francis Palco](https://github.com/jeydpeaschocolatebar)
