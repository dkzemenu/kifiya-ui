---
paths:
  - "**/test/**"
  - "**/tests/**"
  - "**/*_test.go"
  - "**/*Test.java"
  - "**/*IT.java"
  - "**/test_*.py"
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Testing

- **Changed behaviour has tests; tests assert behaviour, not implementation.** A test that breaks on a refactor with unchanged behaviour is a bad test.
- **Every `I-nn` invariant has at least one test whose name contains the ID** (`I-02 payment never captured twice…`). Missing one = not done.
- **Every `R-nn` has at least one end-to-end test at the transport layer** (request in → response + persisted state out).
- **Test pyramid:** domain rules as pure unit tests (no I/O) · use cases with fakes for ports · repositories against a real database via containers (never an in-memory stand-in) · a thin set of transport tests.
- **Fakes over mocks.** Hand-written fakes for ports live in one test-support folder; mocking frameworks only at true external boundaries.
- **Deterministic:** injected clock and ID generator; no sleeps; no shared mutable state between tests; run with race/parallel detection where the stack supports it.
- **Fixtures contain no real PII, secrets, or production data.**
- **Run the suite the stack rule names before every "done" claim; paste failures verbatim** — never "some tests fail".
- **Contract tests:** the committed OpenAPI spec is diffed for breaking changes in CI; consumer-facing event schemas likewise.
- Do not delete, skip, or weaken a failing test to get green. Report it; the user decides.

## Coverage of a change

- **80 % minimum coverage on changed and new lines** (diff coverage — not the file, not the repo). A floor, not a target: do not scale back once 80 % is reached if the code's risk warrants more.
- **The 80 % also applies to the directly affected surface**: direct callers of a changed function, direct dependents of a changed shared type, schema or state. Not transitive callers several layers away. State in the task summary which were identified and whether they were already covered or newly covered.
- **Pre-existing untested code in a touched file is flagged as debt, not made a blocker** for the current change.
- **Any new function containing logic** (branching, calculation, parsing, transformation) **gets a unit test in the same change.** Cover the failure and edge path — empty input, null, boundary values, unexpected type — not only the happy path.
- **A bug fix ships with a regression test that fails without the fix and passes with it.** No silent fixes.
- **Test names state the behaviour verified** (`rejects_negative_amount`), never `test1` or `test_edge_case`.
- **If 80 % cannot be met** (untestable framework glue, an entangled caller), say why in the task summary. Never pad with low-value tests to hit the number.
