---
paths:
  - "**/payments/**"
  - "**/payment/**"
  - "**/ledger/**"
  - "**/billing/**"
  - "**/wallet/**"
---

# Domain: payments & money movement

- **Every money-moving operation is idempotent by client-supplied key**, stored with the result; a replay returns the original outcome, a key reuse with a different payload is a 409.
- **Double-entry or append-only ledger semantics:** balances are derived, never stored as the only truth; entries are immutable; corrections are new entries, never edits or deletes.
- **State machines are explicit.** Every payment/transfer status and allowed transition is enumerated in code and traces to `PRODUCT.md`; an unlisted transition is a `D-nnn`, not a guess.
- **Amounts:** integer minor units + currency on every entity and every wire field; a mismatch of currencies across lines is a domain error, not a conversion.
- **Never store PANs, CVVs, or full account numbers.** Tokenise via the provider; store the token and last-4 only if `PRODUCT.md` allows it.
- **External provider calls:** timeout, idempotent retry with the same provider reference, and a reconciliation path for "unknown outcome" (timeout after send). Unknown ≠ failed.
- **Audit:** who/what/when for every state change, as a domain event and a log line (`event=payment.<transition>`), with IDs only.
- **Reversal/refund semantics, fee allocation, rounding, and settlement cut-offs are business decisions** — always `D-nnn` unless `PRODUCT.md` §5 states them.
