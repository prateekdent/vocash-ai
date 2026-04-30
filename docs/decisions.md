# Architecture Decisions and Open Questions

## ADR-001: Backend as Business Rule Authority
- Status: Accepted
- Decision: Enforce extraction limits, category validation, and entitlement checks only on backend.
- Reason: Prevent client bypass and maintain consistent monetization logic.

## ADR-002: Lightweight Monorepo (No Nx/Turbo Yet)
- Status: Accepted
- Decision: Start with simple folders and add orchestrator tooling later.
- Reason: Faster onboarding and less setup risk at MVP start.

## Open Decision D-001: Speech-to-Text Provider
- Status: Open
- Context: PRD stack uses `@react-native-voice/voice`; risk section recommends Google Cloud STT for better Hindi accuracy.
- Options:
  - A) Device-native STT via RN voice package only (lower cost, simpler).
  - B) Cloud STT fallback for low-confidence transcripts (higher accuracy, added cost/latency).
- Needed by: Before production beta.

## Open Decision D-002: Google Sign-In Scope in MVP
- Status: Open
- Context: Screen spec includes Google sign-in, API contracts do not.
- Decision needed: Include in MVP or defer to post-MVP.

## Open Decision D-003: Pro Feature Depth in MVP
- Status: Open
- Context: Family accounts/cloud backup/export are listed but no concrete API/data design exists.
- Decision needed: Define exact MVP Pro subset for first release.

## Open Decision D-004: Relative Date Parsing Rules
- Status: Open
- Context: Inputs like “kal”, “parso”, “last Monday” can be interpreted ambiguously.
- Decision needed: deterministic parsing policy with timezone and locale test cases.

## Implementation Note I-001: Extract Limit Wiring Gap
- Status: Resolved
- Context: `/usage/today` and usage limit service are implemented, and `/expense/extract` now enforces free-tier limit in route flow.
- Outcome: Contract-aligned `429 LIMIT_REACHED` behavior is active.

## Implementation Note I-002: Expense List Query Naming
- Status: Accepted
- Context: PRD examples use `from`/`to`; current backend uses `from_date`/`to_date`.
- Decision: Keep `from_date`/`to_date` for clarity; document this explicitly in API contracts.
