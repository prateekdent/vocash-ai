# Vocash Agent Operating Guide

## Purpose
This file defines guardrails for human and AI contributors working on Vocash.

## Approved Stack
- Mobile: React Native (TypeScript), React Navigation, Zustand, Axios.
- Backend: FastAPI (Python 3.11), Pydantic v2, Uvicorn.
- Database: MongoDB Atlas with Motor (async), selective PyMongo utility usage.
- AI: OpenAI (`gpt-4o-mini`) through backend only.
- Payments: Razorpay (verification and subscription logic in backend).

## Architecture Boundaries
- Backend is the source of truth for:
  - AI extraction logic and prompt templates.
  - Usage limits, monetization entitlements, and plan checks.
  - Data validation, category normalization, and business rules.
- Mobile handles:
  - UI/UX, microphone capture, local session state, and API presentation.
  - Never hardcode business rules that should be validated by backend.
- OpenAI API key and calls must never exist in mobile code.

## Coding Rules
- Keep changes focused and small; avoid large cross-cutting edits in one PR.
- Prefer explicit types and schema validation over implicit structures.
- Add tests for all business-critical backend behaviors.
- Use environment variables for secrets and environment-specific values.
- Do not introduce new frameworks without documenting why in `docs/decisions.md`.

## Change Management
- Before major changes (new module, data model change, auth flow change):
  - Write/update a plan in `docs/development-plan.md`.
  - Record trade-offs and unresolved questions in `docs/decisions.md`.
- For any API contract change:
  - Update `docs/api-contracts.md`.
  - Update impacted frontend flow docs in `docs/frontend-flows.md`.
  - Keep backward compatibility unless a breaking change is approved and documented.
- For DB schema changes:
  - Update `docs/db-schema.md`.
  - Add migration/backfill approach in the implementation PR notes.

## File Safety Rules
- Do not touch unrelated files.
- Do not refactor outside the scoped task unless required to unblock correctness.
- If unrelated local changes are present, preserve them and work around them.

## Testability Requirements
- Every module change should be testable in isolation.
- Backend:
  - Unit tests for parsing/validation and limit logic.
  - Integration tests for API endpoint happy path and failure path.
- Mobile:
  - Screen state tests for loading/success/error where feasible.
  - Manual verification notes for voice flow on emulator/simulator.

## Documentation Requirements
- If contracts, flows, architecture, or business rules change, update docs in the same change.
- If assumptions are made due to missing requirements, add them to `docs/decisions.md`.

## Security and Privacy
- Never commit secrets or user data.
- Store hashed passwords only (bcrypt/passlib).
- Enforce JWT auth on protected routes.
- Minimize personally identifiable information in logs.
