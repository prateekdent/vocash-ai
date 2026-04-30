# Architecture

## High-Level Design
Three-tier system:
1. Mobile client (React Native)
2. Backend API (FastAPI)
3. Data + AI services (MongoDB Atlas + OpenAI)

## Responsibilities

### Mobile (`apps/mobile`)
- Capture voice and perform speech-to-text on device.
- Display transcript for user verification/edit.
- Call backend for extraction and persistence.
- Manage authenticated session token locally.
- Render dashboard and list views.

### Backend (`backend`)
- JWT-based auth and user identity resolution.
- Enforce usage limits and entitlement checks.
- Call OpenAI for extraction with controlled prompts.
- Normalize category and validate payloads.
- Persist and query expenses and aggregates.
- Verify Razorpay payments and update plan state.

### Database (MongoDB Atlas)
- Store source-of-truth user, expense, usage, and budget documents.
- Support indexed queries for user/date/category listing and summaries.

### AI Layer (OpenAI)
- Convert natural-language expense text into strict JSON schema.
- No direct client access; backend-only integration.

## Request Lifecycle (Voice)
1. User speaks on mobile.
2. Mobile obtains transcript via STT.
3. Mobile sends transcript to `POST /expense/extract`.
4. Backend checks auth + daily limit.
5. Backend calls OpenAI model with extraction prompt.
6. Backend validates/normalizes response.
7. Mobile shows editable confirmation state.
8. Mobile sends confirmed payload to `POST /expense/save`.
9. Backend persists expense and updates aggregates.

## Cross-Cutting Constraints
- Backend is source of truth for limits, categories, and monetary values.
- All protected routes require JWT.
- Timezone standard: Asia/Kolkata for date interpretation and daily usage counting.
- Do not expose OpenAI or Razorpay secret keys to mobile.

## Initial Monorepo Choice
Using a lightweight monorepo layout without Nx/Turborepo in foundation phase to reduce tooling overhead. Add build orchestration tooling only after backend + mobile workflows stabilize.
