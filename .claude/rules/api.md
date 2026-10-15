---
paths:
  - "**/api/**"
  - "**/transport/**"
  - "**/openapi/**"
  - "**/*controller*"
  - "**/*handler*"
  - "**/*router*"
  - "**/*route*"
  - "**/openapi.*"
---

# API versioning & contracts

- **Major version in the path:** `/api/v1/...`, set once in the router. At most one current and one deprecated major version live at a time.
- **Within a version: additive only.** Never remove or rename a field, change a type, tighten validation, change a default, or change semantics. Any of those is a new major version and a `D-nnn`.
- **Contract source of truth is the OpenAPI document in the repo.** Spec and code change in the same commit; code without the spec update is incomplete. CI diffs the spec for breaking changes.
- **Deprecation:** `Deprecation` and `Sunset` headers on deprecated versions; recorded in `CHANGELOG.md` with the removal date from `PRODUCT.md` or a `D-nnn`.
- **Uniform error envelope** — every non-2xx body:
  ```json
  { "error": { "code": "UPPER_SNAKE_CASE", "message": "safe, human-readable", "details": [ { "field": "…", "issue": "…" } ], "trace_id": "…" } }
  ```
  `code` values come from one registry file. A new code is a suggestion → approval.
- **Status codes:** 400 malformed/validation · 401 unauthenticated · 403 unauthorised · 404 not found (never to hide 403 unless `PRODUCT.md` says so) · 409 conflict / idempotency replay mismatch · 422 business-rule violation · 429 rate limit · 500 only for genuine unknowns.
- **Pagination:** cursor-based; `limit` has a server-side cap from `PRODUCT.md` §5 or a `D-nnn`.
- **State-changing endpoints accept `Idempotency-Key`**; replays return the original result. Implemented once (middleware/interceptor), never per handler.
- **Unknown request fields** are ignored (additive compatibility) unless `PRODUCT.md` marks the endpoint strict.
- Wire casing is fixed by the stack rule; never mix.
- **Events/messages** are contracts under the same rules — see `domains/events.md`.
