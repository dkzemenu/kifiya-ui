---
paths:
  - "**/events/**"
  - "**/messaging/**"
  - "**/consumers/**"
  - "**/producers/**"
  - "**/kafka/**"
  - "**/rabbit*/**"
  - "**/sqs/**"
  - "**/pubsub/**"
---

# Domain: events & messaging

- **Events are versioned contracts** with the same additive-only rule as APIs: schema file committed (`events/<name>.v<N>.<json|avro|proto>`), breaking change = new version, both versions produced during migration.
- **Envelope on every event:** `event_id` (UUIDv7), `event_type`, `event_version`, `occurred_at` (UTC), `producer`, `trace_id`, `aggregate_id`, `payload`.
- **Outbox pattern** for anything published as a side effect of a DB write — never "write then publish" in two uncoordinated steps.
- **Consumers are idempotent** (dedupe on `event_id`) and tolerate redelivery and reordering unless `PRODUCT.md` guarantees ordering per key.
- **Poison messages** go to a dead-letter destination after a bounded retry count with the failure reason; never block the partition indefinitely, never drop silently.
- **Payloads carry IDs and facts, not PII**, unless `PRODUCT.md` §7 explicitly allows the field.
- **Topic/queue names, partition keys, retention, and ordering guarantees are decisions** → `D-nnn` unless stated in `PRODUCT.md`.
- Log `event=<event_type>.published` / `.consumed` / `.dead_lettered` with `event_id`, never the payload.
