# Security baseline (always loaded)

- **Secrets** live in the environment or a secret manager only. Never in source, config files, fixtures, test data, logs, or commit history. Never create, edit, read, or print `.env*` files. The one file of that shape that belongs in the repo is `.env.example` — variable names only, no values — and a human creates it; the hook and the read-deny rule still treat it as `.env*`, so propose its contents rather than writing it.
- **Trust boundary:** every external input (HTTP, message, file, CLI, env) is validated and typed at the edge before it reaches application or domain code. Domain code assumes validated input and never re-parses raw payloads.
- **AuthN on every endpoint by default.** Public endpoints are only those listed in `PRODUCT.md` §6. **AuthZ** decisions live in one policy/guard layer, never inline in handlers.
- **No PII, credentials, tokens, session IDs, or full account/card numbers** in logs, error messages, URLs, query strings, or fixtures. Log opaque IDs and counts; redact the rest.
- **Money** is integer minor units + ISO 4217 currency code. Never `float`/`double`. Rounding rules come from `PRODUCT.md` §5 or a `D-nnn` — never from you.
- **Parameterised queries only.** No string-built SQL, shell, LDAP, or template expressions from external input.
- **Dependencies:** pinned versions, lockfile committed. A new dependency is a suggestion: state why, the alternative considered, its maintenance status; wait for approval.
- **Error responses** never leak stack traces, internal exception text, SQL, hostnames, or internal IDs. Use the envelope in `api.md`.
- **Security-adjacent changes are flagged, never self-assessed.** If a change touches auth, encryption, session handling or anything PII-adjacent, say so explicitly in the task summary and flag it for Security-team review; do not conclude "safe" on your own.
- **A suspected security issue outside the task's scope is reported, not patched.** Flag it to the Security team or the owner; do not fix it on your own judgment.
- **Outbound calls** always have a timeout; TLS verification is never disabled, not even "for local".
- **Protected paths** are listed in `protected-paths.txt` — that file is the single source of truth — and enforced by the `protect-paths.sh` hook, which blocks the edit outright rather than asking. Do not attempt the edit, even when the task requires it: propose the change and a human applies it (or an operator knowingly sets `KIFIYA_ALLOW_PROTECTED=1`). The template baseline protects `payments/`, `ledger/`, `migrations/`, `infra/`, `deploy/`, `auth/`, `authz/`, `.env`, CI config, `.claude/`, `CLAUDE.md`, `PRODUCT.md` and `protected-paths.txt` itself. Matching is by path prefix from the repo root, so a nested `src/auth/` needs its own line.
