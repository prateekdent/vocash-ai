# Vocash

Voice-powered AI expense tracker for India (Hindi + English), built with React Native, FastAPI, MongoDB Atlas, and OpenAI.

## Repository Structure
- `apps/mobile` - React Native mobile app.
- `backend` - FastAPI backend API and business logic.
- `docs` - Product, architecture, contracts, schema, and delivery docs.
- `prompts` - Reusable AI execution templates for feature and debugging work.
- `scripts` - Project automation and helper scripts.
- `.cursor` - Cursor-local workspace config (not committed secrets).

## Product Scope (MVP)
- User auth (email/password; Google sign-in planned).
- Voice-to-expense flow in Hindi/English.
- AI extraction via backend (`amount`, `category`, `item`, `date`, `notes`).
- Daily free extraction cap (3/day) with Pro upgrade path.
- Expense CRUD, dashboard summary, transaction list, usage tracking.

## Non-Goals (for MVP foundation phase)
- Full feature implementation.
- Premature optimization and broad infrastructure automation.
- Adding optional integrations before core voice + expense loop is stable.

## Local Development Targets
- Backend local URL: `http://localhost:5000`
- Swagger docs: `http://localhost:5000/docs`
- Android emulator API base: `http://10.0.2.2:5000`
- iOS simulator API base: `http://localhost:5000`

## Environment Setup
Copy `.env.example` values into local env files before running backend/mobile.

## Working Rules
- Backend remains source of truth for extraction logic, usage limits, and plan access.
- Any API/DB change must update `docs/api-contracts.md` and/or `docs/db-schema.md`.
- Major scope changes must be logged in `docs/decisions.md`.

## Immediate Build Sequence
1. Backend foundation (auth, extraction, usage limit, expense CRUD).
2. Mobile auth + voice input + confirmation + transaction list.
3. Dashboard analytics.
4. Monetization and polish.

See `docs/development-plan.md` for full phased delivery.
