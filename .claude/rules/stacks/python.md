---
paths:
  - "**/*.py"
  - "**/pyproject.toml"
  - "**/alembic.ini"
---

# Stack: Python 3.12 · FastAPI · Pydantic v2

Concrete tooling that satisfies `CLAUDE.md` and the rules in `.claude/rules/`. Parenthesised names point to the rule a section implements. Where this file and a rule disagree, the rule wins — report the conflict.

## Toolchain & commands

| Task | Command |
|------|---------|
| Env / deps | `uv sync` — `pyproject.toml` + `uv.lock` committed; no `requirements.txt` drift |
| Test | `uv run pytest -q` — run before every "done" claim (testing.md) |
| Format | `uv run ruff format .` |
| Lint | `uv run ruff check .` (rules: E,F,I,B,UP,S(bandit),ASYNC,DTZ,T20(no print)) |
| Types | `uv run mypy --strict src/` — must pass |
| Vulns | `uv run pip-audit` |
| Run local | `uv run uvicorn <service>.main:app --reload` |

## Layout (architecture.md)

```
src/<service>/
  main.py               app factory: config → logging → routers → handlers; no logic
  api/
    v1/                 routers, request/response schemas (pydantic), dependencies (auth)
    errors.py           exception handlers → envelope
    codes.py            ErrorCode enum
  application/          use cases (plain classes / functions), unit-of-work
  domain/               frozen dataclasses / value objects, rules, ports (Protocols), exceptions — no fastapi/sqlalchemy/pydantic imports
  infrastructure/
    db/                 SQLAlchemy 2.0 models, repositories, session
    clients/            httpx clients
  config.py             pydantic-settings
migrations/             Alembic (versions/ files)
openapi/openapi.yaml    exported spec, committed (api.md)
tests/
```

- `domain/` imports only stdlib + `typing`. Enforced by `import-linter` contract in `pyproject.toml`.
- Ports are `typing.Protocol`s in `domain/ports.py`; implementations in `infrastructure/`.
- Dependency injection via FastAPI `Depends` at the API layer only; `application/` receives ports as constructor args.

## Config (architecture.md)

- `pydantic_settings.BaseSettings` in `config.py`, `model_config = SettingsConfigDict(env_prefix="APP_")`, all required fields un-defaulted → startup `ValidationError` = fail fast. Nothing else reads `os.environ`.
- No `.env` loading in prod code paths; local dev only via `uv run --env-file`.

## Validation at the boundary (security.md)

- Request bodies/query params are pydantic v2 models with `model_config = ConfigDict(extra="ignore")` (additive compatibility) — `extra="forbid"` only where `PRODUCT.md` marks an endpoint strict.
- Constrained types (`Annotated[int, Field(ge=1, le=100)]`) — limits come from `PRODUCT.md` §5 or a `D-nnn`, never invented.
- Domain value objects validate invariants in `__post_init__` and raise `DomainError` subclasses (trace to `I-nn`).

## Error mapping (api.md)

- `api/errors.py` registers handlers: `RequestValidationError` → 400 `VALIDATION_FAILED` with `details=[{field, issue}]` · `NotAuthenticated` → 401 · `Forbidden` → 403 · `NotFound` → 404 · `Conflict` → 409 · `DomainRuleViolation` → 422 · `Exception` → 500 `INTERNAL_ERROR` (fixed message; logged once).
- `ErrorCode` is a `StrEnum` in `api/codes.py`. New member = suggestion → approval.
- `trace_id` from `opentelemetry.trace.get_current_span().get_span_context().trace_id` formatted as 32-hex.

## Logging (logging.md)

- `structlog` with JSON renderer, stdlib logging routed through it; configured once in `main.py`:

```python
import logging, structlog
from structlog.contextvars import merge_contextvars

def configure_logging(service: str, env: str, version: str, level: str) -> None:
    structlog.configure(
        processors=[
            merge_contextvars,                                   # trace_id / span_id / request-scoped fields
            structlog.processors.add_log_level,                  # "level"
            structlog.processors.TimeStamper(fmt="%Y-%m-%dT%H:%M:%S.%fZ", utc=True, key="ts"),
            lambda _l, _m, ev: {**ev, "service": service, "env": env, "version": version},
            structlog.processors.EventRenamer("msg", "event"),   # structlog's "event" → msg; our "event" key survives via replace_by
            structlog.processors.format_exc_info,                # error.stack
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(level)),
        cache_logger_on_first_use=True,
    )
```
- Call sites: `log.info("order created", event="order.created", order_id=str(order.id))` — positional string becomes `msg`, `event=` is mandatory. Level values are uppercased by a small processor (`ev["level"] = ev["level"].upper()`).
- `trace_id`/`span_id` bound with `structlog.contextvars.bind_contextvars` in an ASGI middleware that also emits the single `event=http.request` summary line (`method`, `route` = `request.scope["route"].path`, `status`, `duration_ms`). Disable uvicorn access logs (`--no-access-log`).
- Errors: `log.error("…", event="…", **{"error.type": type(e).__name__, "error.message": str(e)}, exc_info=True)` exactly once, in the handler.

## Persistence & migrations (data.md)

- SQLAlchemy 2.0 (async, `Mapped[]` typing). Queries via the expression API only; no `text()` with interpolated values.
- Alembic: `alembic revision --autogenerate -m "<snake_desc>"` then **read and edit** the generated file before committing; `downgrade()` implemented or documented no-op. Never edit an applied revision. Revision files are a protected path.
- Money: `amount_minor: Mapped[int]` (BIGINT) + `currency: Mapped[str]` (CHAR(3)) → `domain.Money(minor: int, currency: str)`. No `float`; `Decimal` only for rates.
- Time: `datetime` always tz-aware (`DTZ` ruff rules enforce) ↔ `TIMESTAMP(timezone=True)`; `now()` via an injected `Clock` protocol.
- IDs: `uuid6.uuid7()` (or `uuid_utils`) behind `domain.IdGen`; column `UUID`.

## API (api.md)

- `APIRouter(prefix="/api/v1")` defined once in `api/v1/__init__.py`; feature routers included into it without their own version.
- Spec: FastAPI generates OpenAPI at runtime; export it to `openapi/openapi.yaml` in CI (`scripts/export_openapi.py`) and diff with `oasdiff --fail-on-breaking`. Committed spec is the contract; a diff in CI = incomplete change.
- JSON `snake_case` (pydantic default). Response models always declared (`response_model=`); never return ORM objects.
- `Idempotency-Key` via one dependency + store protocol.
- Outbound `httpx.AsyncClient` with explicit `timeout=httpx.Timeout(...)`, created once and injected; retries via `tenacity` only on idempotent calls.

## Testing (testing.md)

- `pytest` + `pytest-asyncio` + `httpx.AsyncClient(transport=ASGITransport(app))`. `testcontainers[postgres]` for repository tests — no SQLite stand-in.
- Fakes for ports (in `tests/fakes/`), not `MagicMock` everywhere.
- Each `I-nn` has a test named for it: `test_i02_payment_never_captured_twice`.

## Forbidden

`print` · bare `except:` / `except Exception: pass` · mutable default args · `datetime.now()` / `utcnow()` without tz · `float` for money · `import *` · `os.environ` outside `config.py` · sync I/O inside async handlers · returning SQLAlchemy models from routes · `Any` in public signatures without a decision · f-string SQL.
