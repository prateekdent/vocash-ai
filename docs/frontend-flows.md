# Frontend Flows (React Native)

## Screen Map (MVP)
1. Login
2. Signup
3. Dashboard
4. Voice Input
5. Transactions
6. Profile/Settings

## 1) Authentication Flow
- States: unauthenticated, submitting, authenticated, error.
- Journey:
  - User registers/logs in.
  - Token stored in AsyncStorage.
  - App boot checks token and fetches `/auth/me`.
  - Invalid token clears local session and redirects to Login.

## 2) Dashboard Flow
- Data sources: `/dashboard/summary`, optional `/usage/today`.
- States: loading, loaded, empty, error.
- UI blocks:
  - monthly total card
  - category pie chart
  - last 5 transactions
  - quick action to voice input

## 3) Voice Input Flow
- See `docs/voice-flow.md`.
- Core CTA path: Record -> Extract -> Confirm -> Save.

## 4) Transactions Flow
- Data source: `/expense/list`.
- Filters: date range, category, amount/search text (phase-based rollout).
- Actions: edit, delete, pull-to-refresh, pagination.
- States: loading, list, empty, error.

## 5) Profile/Settings Flow
- Data source: `/auth/me`, `/usage/today`, later plan/payment status.
- Display:
  - current plan (Free/Pro)
  - daily usage counter
  - upgrade CTA
  - logout

## Shared UX Constraints
- Hindi + English labels where useful; avoid crowded bilingual text in MVP.
- Error copy should provide direct action (retry/edit/upgrade/manual).
- Keep primary flows one-handed and low-friction.
