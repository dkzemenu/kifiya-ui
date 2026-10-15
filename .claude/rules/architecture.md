# Architecture (always loaded)

Four layers; dependencies point inward only:

```
transport      http / grpc / consumers / cli           ─┐
application    use cases, transactions, orchestration   │ depend on
domain         entities, value objects, rules, invariants, ports  ◄┘
infrastructure db, brokers, http clients, cache  → implements domain ports
```

- **Domain has zero framework or I/O imports.** The stack rule names the tool that enforces this.
- No business logic in handlers/controllers; no transport or persistence types in the domain.
- **One module/package per bounded concern.** Cross-concern calls go through the application layer — never by reaching into another module's repository or tables.
- **Ports are defined by the consumer** (domain/application) and implemented in infrastructure. No shared "interfaces" dumping ground.
- **Config** comes from the environment, is validated once at startup, and fails fast with a clear message. Nothing else reads env vars.
- **Outbound calls:** always a timeout; retries only on idempotent operations, with jittered backoff and a cap; circuit-break where a dependency failure would cascade.
- **Every state-changing operation is idempotent** — by idempotency key or natural key. Say which in the plan.
- **Clock and ID generation are injected ports**, never called directly from domain or application code (testability, determinism).
- Introducing a new layer, module, port, cross-cutting mechanism, or shared library is an architecture decision → `D-nnn`.

Cross-references you must keep in mind even when the scoped rule is not loaded: API shape rules in `api.md` (loads on `**/api/**`, `**/transport/**`), schema rules in `data.md` (loads on `**/migrations/**`, `**/infrastructure/**`, `**/domain/**`). If you are about to touch one of those areas, read the rule first.
