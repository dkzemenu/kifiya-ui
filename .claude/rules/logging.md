# Uniform logging (always loaded)

- **Structured JSON, one event per line, to stdout.** No printf-style or string-concatenated logs. The stack rule names the library and the exact config that emits this shape.
- **Mandatory fields on every line:**
  `ts` (RFC 3339 UTC, ms) · `level` (`DEBUG|INFO|WARN|ERROR`) · `service` · `env` · `version` · `trace_id` · `span_id` · `event` (stable `dot.namespaced` identifier: `order.created`, `http.request`, `db.query.slow`) · `msg` (human sentence).
  Context fields are flat, `snake_case`, typed (numbers as numbers, not strings).
- **Level semantics:** `ERROR` = needs human action or work was lost · `WARN` = degraded but handled · `INFO` = business-relevant state change or request summary · `DEBUG` = off in production.
- **One request → one `INFO` summary line at the edge** (`event=http.request`, `method`, `route` (templated, never the raw path), `status`, `duration_ms`) plus any `WARN`/`ERROR`. Not a line per layer.
- **Errors are logged once**, at the boundary that handles them, with `error.type`, `error.message`, `error.stack`. Never log-and-rethrow. Never swallow.
- **Never log:** request/response bodies wholesale, headers, secrets, tokens, PII, full account/card numbers, SQL with bound values. Log IDs and counts.
- **Trace propagation:** accept W3C `traceparent` inbound, emit it outbound, include `trace_id` in the error envelope.
- New business `event` names are fine. Renaming or removing an existing one is a contract change (dashboards depend on it) → suggestion, wait.
