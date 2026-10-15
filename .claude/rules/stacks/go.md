---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
  - "**/.golangci.yml"
---

# Stack: Go 1.22+

Concrete tooling that satisfies `CLAUDE.md` and the rules in `.claude/rules/`. Parenthesised names point to the rule a section implements. Where this file and a rule disagree, the rule wins — report the conflict.

## Toolchain & commands

| Task | Command |
|------|---------|
| Build | `go build ./...` |
| Test | `go test -race -count=1 ./...` — run before every "done" claim (testing.md) |
| Format | `gofmt -l .` must print nothing; `goimports -local <module>` |
| Lint | `golangci-lint run` (config `.golangci.yml`: errcheck, govet, staticcheck, gosec, sqlclosecheck, bodyclose, exhaustive, noctx) |
| Vulns | `govulncheck ./...` |
| Deps | `go.mod` + `go.sum` committed; `go mod tidy` leaves no diff |
| Generate | `go generate ./...` (oapi-codegen, sqlc) — generated code committed |

## Layout (architecture.md)

```
cmd/<service>/main.go        wiring only: config → deps → server; no logic
internal/
  transport/http/            handlers, request/response structs, middleware, error mapping
  app/                       use cases; one struct per bounded concern, deps injected via interfaces
  domain/                    entities, value types, rules, port interfaces, sentinel errors — stdlib only
  infra/
    postgres/                repositories implementing domain ports (pgx + sqlc)
    <client>/                outbound HTTP/gRPC clients
  config/                    env parsing + validation
migrations/                  NNNN_<snake_desc>.up.sql / .down.sql
api/openapi.yaml             source of truth (api.md)
```

- Everything under `internal/`; no `pkg/` unless another module imports it (that's a decision).
- `domain/` imports nothing outside stdlib. Enforced by `go-arch-lint` or a `depguard` rule in `.golangci.yml`.
- Interfaces are defined by the consumer (in `domain/` or `app/`), implemented in `infra/`. No `interfaces.go` dumping ground.

## Config (architecture.md)

- `internal/config.Load()` reads env (`caarlos0/env` or `kelseyhightower/envconfig`) into one struct with `required` tags, validates, returns error → `main` exits non-zero with the message. Nothing else reads `os.Getenv`.

## Validation at the boundary (security.md)

- Decode into a request struct, then validate with `go-playground/validator` tags or explicit code; reject before calling `app`. Handlers never pass `*http.Request` or raw maps inward.
- Domain constructors (`NewMoney`, `NewOrderID`) return `(T, error)` and enforce invariants; those checks trace to `I-nn`.

## Error mapping (api.md)

- Domain sentinel errors in `domain/errors.go`: `ErrNotFound`, `ErrConflict`, `ErrRuleViolation{Code, Msg}`, `ErrUnauthorized`, `ErrForbidden`. Wrap with `fmt.Errorf("…: %w", err)`; never compare strings.
- One `transport/http/errors.go` maps via `errors.Is/As` → status + envelope. Unknown error → 500 `INTERNAL_ERROR`, message fixed, original logged once (logging.md).
- Error codes are typed constants in `transport/http/codes.go`. New constant = suggestion → approval.
- `trace_id` from `trace.SpanFromContext(ctx).SpanContext().TraceID()`.

## Logging (logging.md)

- `log/slog` with `slog.NewJSONHandler`, keys renamed to the logging.md schema, injected via `context.Context` (no package-level logger in `domain/` or `app/`):

```go
func NewLogger(service, env, version string) *slog.Logger {
    h := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: levelFromEnv(),
        ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {
            switch a.Key {
            case slog.TimeKey:
                a.Key = "ts"
                a.Value = slog.StringValue(a.Value.Time().UTC().Format("2006-01-02T15:04:05.000Z07:00"))
            case slog.LevelKey:
                a.Key = "level" // values already DEBUG/INFO/WARN/ERROR
            case slog.MessageKey:
                a.Key = "msg"
            }
            return a
        },
    })
    return slog.New(h).With("service", service, "env", env, "version", version)
}
```
- A `TraceHandler` wrapper adds `trace_id`/`span_id` from ctx on every record. Call sites: `logger.InfoContext(ctx, "order created", "event", "order.created", "order_id", id)`. Always include `event`.
- Request summary: one middleware emitting `event=http.request`, `method`, `route` (the mux pattern, not `r.URL.Path`), `status`, `duration_ms`.
- Errors: `logger.ErrorContext(ctx, "…", "event", "…", "error.type", fmt.Sprintf("%T", err), "error.message", err.Error())`; stack via `errors` wrapping chain or `runtime/debug` only at ERROR.

## Persistence & migrations (data.md)

- `pgx/v5` + `sqlc` (queries in `internal/infra/postgres/queries/*.sql`, generated code committed). No `database/sql` string building; no ORM unless a decision says so.
- Migrations: `golang-migrate` (or `goose`) SQL files, `.up.sql` and `.down.sql` both required; `.down.sql` may be a documented no-op for additive changes. Never edit an applied file.
- Money: `amount_minor bigint` + `currency char(3)` → `domain.Money{Minor int64; Currency string}`. No `float64`.
- Time: `time.Time` in UTC ↔ `timestamptz`; `time.Now().UTC()` only through an injected `Clock` interface (testability).
- IDs: UUIDv7 (`github.com/google/uuid` v1.6+ `uuid.NewV7()`) behind a `domain.IDGen` port.

## API (api.md)

- `net/http` `ServeMux` with method patterns (`mux.HandleFunc("GET /api/v1/orders/{id}", …)`); or chi if already present. Version prefix set once in `transport/http/router.go`.
- Spec-first: `api/openapi.yaml` → `oapi-codegen` generates server interfaces + types; handlers implement them. Hand-written response structs are forbidden.
- JSON `snake_case` via struct tags; `encoding/json` with `DisallowUnknownFields` only on endpoints `PRODUCT.md` marks strict.
- `Idempotency-Key` via one middleware + store interface; handlers don't implement it individually.
- Every outbound `http.Client` has `Timeout` set and uses `ctx`; retries via a shared helper with jittered backoff, only on idempotent calls.

## Testing (testing.md)

- Stdlib `testing`; `testify/require` allowed. Table-driven tests. `httptest` for handlers. `testcontainers-go` for Postgres — no sqlmock for repository tests.
- `-race` always. Golden files for OpenAPI compatibility (`oasdiff` in CI for additive-only check).
- Each `I-nn` invariant has a test whose name includes the ID: `TestI02_PaymentNeverCapturedTwice`.

## Forbidden

`panic` for control flow · `init()` with side effects · package-level mutable state · `context.Background()` outside `main`/tests · `log.Printf`/`fmt.Println` for logging · `interface{}`/`any` in exported APIs without a decision · ignoring returned errors (`_ = f()`) · `time.Now()` outside the `Clock` adapter · `float64` for money · `select *` in queries · goroutines without a bounded lifetime (`errgroup` with ctx).
