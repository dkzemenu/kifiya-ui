---
paths:
  - "**/*.ts"
  - "**/*.mts"
  - "**/*.js"
  - "**/*.mjs"
  - "**/package.json"
  - "**/tsconfig*.json"
---

# Stack: Node 22 LTS · TypeScript (strict) · Fastify

Concrete tooling that satisfies `CLAUDE.md` and the rules in `.claude/rules/`. Parenthesised names point to the rule a section implements. Where this file and a rule disagree, the rule wins — report the conflict. (NestJS mapping at the end.)

## Toolchain & commands

| Task | Command |
|------|---------|
| Deps | `pnpm install --frozen-lockfile`; `pnpm-lock.yaml` committed; `engines.node` pinned |
| Typecheck | `pnpm tsc --noEmit` — `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` |
| Test | `pnpm vitest run` — run before every "done" claim (testing.md) |
| Lint | `pnpm eslint .` (typescript-eslint strict-type-checked, `no-floating-promises`, `no-explicit-any`, `no-console`, `eslint-plugin-security`) |
| Format | `pnpm prettier --check .` |
| Vulns | `pnpm audit --prod` |
| Run local | `pnpm tsx watch src/main.ts` |

## Layout (architecture.md)

```
src/
  main.ts                 bootstrap: config → logger → app → listen; no logic
  app.ts                  Fastify instance factory (plugins, error handler, routes)
  api/
    v1/                   route plugins, zod schemas, auth preHandlers
    errors.ts             setErrorHandler → envelope
    codes.ts              ErrorCode const object
  application/            use cases; classes/functions taking ports
  domain/                 entities, value objects, rules, port interfaces, error classes — no fastify/drizzle/zod imports
  infrastructure/
    db/                   drizzle schema + repositories
    clients/              undici/fetch clients
  config.ts               env parsing (zod)
drizzle/                  generated SQL migrations, committed
openapi/openapi.yaml      exported spec, committed (api.md)
test/
```

- `domain/` imports nothing from `node_modules` except type-only utilities. Enforced with `eslint-plugin-boundaries` (or `dependency-cruiser`).
- Named exports only. No default exports. No barrel `index.ts` re-exporting across layers.
- ESM (`"type": "module"`), `moduleResolution: "NodeNext"`.

## Config (architecture.md)

- `config.ts`: `z.object({...}).parse(process.env)` with `APP_` prefix; parse once at startup; failure throws → process exits non-zero with the zod message. No `process.env` elsewhere.

## Validation at the boundary (security.md)

- Zod schemas per route (`body`, `querystring`, `params`), wired through `fastify-type-provider-zod` so handler types derive from schemas. Unknown keys stripped by default; `.strict()` only where `PRODUCT.md` marks the endpoint strict.
- Numeric limits (`z.number().int().min(1).max(100)`) come from `PRODUCT.md` §5 or a `D-nnn`.
- Domain value objects validate in static factories (`Money.of(minor, currency)`) and throw `DomainError` subclasses (trace to `I-nn`).

## Error mapping (api.md)

- `api/errors.ts` — single `app.setErrorHandler`: zod/Fastify validation → 400 `VALIDATION_FAILED` with `details` · `UnauthenticatedError` → 401 · `ForbiddenError` → 403 · `NotFoundError` → 404 · `ConflictError` → 409 · `DomainRuleViolation` → 422 · anything else → 500 `INTERNAL_ERROR` (fixed message; logged once with stack).
- `ErrorCode` is `as const` object in `api/codes.ts`; new key = suggestion → approval.
- `trace_id` from `@opentelemetry/api` `trace.getActiveSpan()?.spanContext().traceId`.

## Logging (logging.md)

- `pino` (Fastify's native logger), configured to emit the logging.md schema exactly:

```ts
import pino from 'pino';

export const makeLogger = (service: string, env: string, version: string, level: string) =>
  pino({
    level,
    messageKey: 'msg',
    timestamp: () => `,"ts":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      bindings: () => ({ service, env, version }),   // drops pid/hostname
    },
    base: undefined,
    serializers: { err: pino.stdSerializers.err },     // → error.* mapped in a hook below
    hooks: {
      logMethod(args, method) {                        // ensure `event` present in dev; CI lint enforces
        return method.apply(this, args);
      },
    },
    mixin: () => currentTraceContext(),                // { trace_id, span_id } from OTel
  });
```
- Call sites: `req.log.info({ event: 'order.created', order_id: id }, 'Order created')` — object first, `event` mandatory, message second. Never template-string logs.
- Request summary: `disableRequestLogging: true` on Fastify, plus one `onResponse` hook emitting `event: 'http.request'`, `method`, `route: req.routeOptions.url`, `status`, `duration_ms`. Fastify's default `reqId` is replaced by the OTel trace id (`genReqId`).
- Errors: in the error handler only — `log.error({ event, 'error.type': err.name, 'error.message': err.message, 'error.stack': err.stack }, 'Unhandled error')`.

## Persistence & migrations (data.md)

- `drizzle-orm` + `postgres`/`pg`; queries via the query builder only — no `sql.raw` with interpolated values.
- Migrations: `drizzle-kit generate` → SQL file in `drizzle/`, **read and edit** before committing; applied with `drizzle-kit migrate` (never `push` outside local). Never edit an applied file; rollback SQL documented in a header comment.
- Money: `amount_minor bigint` → `bigint` in TS (drizzle `mode: 'bigint'`) + `currency char(3)`. Never `number` for amounts — precision loss past 2^53. Domain `Money { minor: bigint; currency: string }`.
- Time: `timestamp with time zone` ↔ `Date` in UTC only; formatted with `toISOString()`; `now()` via an injected `Clock` port.
- IDs: UUIDv7 (`uuidv7` package) behind `IdGen` port; column `uuid`.

## API (api.md)

- Version prefix registered once: `app.register(v1Routes, { prefix: '/api/v1' })`. Feature plugins never carry a version.
- Spec: `@fastify/swagger` with `fastify-type-provider-zod`'s `jsonSchemaTransform`; exported to `openapi/openapi.yaml` in CI and diffed with `oasdiff --fail-on-breaking`. Committed spec is the contract; a CI diff = incomplete change.
- JSON `snake_case` on the wire (zod schemas define wire names; map to camelCase domain fields explicitly — no auto-casing middleware).
- `Idempotency-Key` via one `preHandler` plugin + store port.
- Outbound calls: `undici` `fetch` with `AbortSignal.timeout(ms)` always; retries via a shared helper, idempotent calls only.

## Testing (testing.md)

- `vitest`; route tests via `app.inject()`; `@testcontainers/postgresql` for repositories — no in-memory DB.
- Fakes for ports in `test/fakes/`; `vi.fn()` only at port boundaries.
- Each `I-nn` has a test whose name includes the ID: `it('I-02 payment never captured twice for same idempotency key')`.

## Forbidden

`any` (use `unknown` + narrowing) · `console.*` · floating promises · `number` for money · default exports · `process.env` outside `config.ts` · `require` · `JSON.parse` on external input without a zod schema · `new Date()` outside the `Clock` adapter · `drizzle-kit push` against shared environments · `// @ts-ignore` (use `@ts-expect-error` with a reason).

## If the repo uses NestJS instead

Same rules, different wiring: `ValidationPipe` with class-validator or `nestjs-zod` at the boundary · one global `ExceptionFilter` for the envelope · `nestjs-pino` with the pino config above · `@nestjs/swagger` exported to `openapi/openapi.yaml` · modules per bounded concern, `domain/` still framework-free (no decorators on domain classes) · versioning via `app.enableVersioning({ type: VersioningType.URI, prefix: 'api/v' })`.
