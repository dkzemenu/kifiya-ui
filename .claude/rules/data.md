---
paths:
  - "**/migrations/**"
  - "**/migration/**"
  - "**/drizzle/**"
  - "**/alembic/**"
  - "**/infrastructure/**"
  - "**/infra/**"
  - "**/domain/**"
  - "**/*repository*"
  - "**/*.sql"
---

# Data architecture

- **This service owns its schema.** No other service reads or writes it directly; integration is via API or versioned events.
- **Schema changes are decisions.** Name every table, column, type, index, nullability and uniqueness constraint in the plan and get approval before writing the migration. Nullability and uniqueness are business rules — derive them from `PRODUCT.md` or raise a `D-nnn`.
- **Migrations:** forward-only, additive, one new file per change, never edit an applied migration. Destructive changes (drop, rename, type narrowing) are two-step expand → contract, each with a documented rollback. Migrations are a protected path (`security.md`).
- **Identifiers:** anything externally visible is opaque and non-guessable (UUIDv7 / ULID) behind an injected `IdGen` port. Sequential DB keys are allowed internally, never exposed.
- **Time:** store UTC with timezone-aware column types; ISO 8601 on the wire; never naive local time. "Date" and "instant" are different types — when `PRODUCT.md` is unclear which one is meant, ask.
- **Money:** integer minor units column + ISO 4217 currency column (or the single typed money column the stack rule names). Never float. Rounding per `PRODUCT.md` §5.
- **Every table:** primary key, `created_at`, `updated_at`. Soft delete only if `PRODUCT.md` requires it.
- **Queries:** parameterised, via the query builder / mapper the stack rule names. No `SELECT *`. Indexes are named in the same migration as the query pattern that needs them.
- **Transactions** are opened in the application layer (use case), never in repositories or handlers.
- **Retention and PII** per table are declared in `PRODUCT.md` §7; a new table without an entry there is a scope change.
