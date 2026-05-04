# Development Plan

## Phase 0 - Foundation (Completed)
Goal: Establish controlled repo structure, contracts, and operating rules.
Deliverables:
- Monorepo folders
- Docs and prompt templates
- Guardrails (`AGENTS.md`)

## Phase 1 - Backend Core (Completed)
Goal: Production-shaped local API for auth + extraction + expense CRUD.
Status:
1. Backend app bootstrap and config management. - Completed
2. MongoDB connection and repository pattern. - Completed
3. Auth endpoints and JWT middleware. - Completed
4. Extraction endpoint with strict response parsing. - Completed
5. Daily usage limiter and usage endpoint. - Completed
6. Expense save/list/update/delete. - Completed
7. Dashboard summary endpoint. - Completed
8. Focused backend tests per module. - Completed
9. Budget endpoints (`/budget/set`, `/budget/status`) with Pro gating. - Completed
10. Payment verification endpoint (`/payment/verify`) with signature check + Pro activation. - Completed

## Phase 2 - Mobile Core (Completed)
Goal: End-to-end user loop from login to saved expense.
Sequence:
1. RN app bootstrap with navigation and state. - Completed
2. Auth screens and token lifecycle. - Completed
3. Voice capture + transcript UI. - Completed (real device voice via `@react-native-voice/voice`, manual fallback for simulator)
4. Extract/confirm/save flow. - Completed
5. Transactions list and edit/delete. - Completed
6. Usage limit UI and graceful failures. - Completed
7. Dashboard summary rendering (month navigator + category breakdown + recent list). - Completed
8. Centralized API error/session handling and stabilization. - Completed
9. Backend deployed to Railway; app tested on physical iPhone. - Completed

## Phase 3 - Analytics (In Progress)
Goal: Better spending visibility and retention drivers.
Sequence:
1. Transactions screen redesign — rows, filters, edit modal. - Completed (2026-05-04)
   - Modular component structure (TransactionRow, CategoryChips, MonthNavigator, EditTransactionModal, categoryColors, filterConstants, date utils).
   - Colored category dots, month navigation, fixed chip filter list, bottom-sheet edit modal.
2. Dashboard / Stats screen redesign. - Completed (2026-05-04)
   - Extracted DashboardScreen.styles.ts; screen is orchestration-only.
   - DashboardSummaryHeader (hero spend block), SpendingProportionBar (multi-color segment bar + legend).
   - CategoryBreakdownRow (dot + name + micro bar + percent + amount).
   - RecentTransactionRow (clean read-only row).
   - MonthNavigator reused with optional onPillPress; top-5 + Others rollup logic.
3. Category normalization at extraction time (backend prompt update). - Pending
4. Search and category drill-down. - Pending
5. Budget UI (connects to existing `/budget/set` and `/budget/status`). - Pending

## Phase 4 - Monetization & Release (Week 6)
Goal: Paid conversion and store readiness.
Sequence:
1. Razorpay verification + plan upgrades.
2. Limit-hit upgrade UX.
3. Ads for free users.
4. Store assets, compliance, submission.

## Engineering Practices per Phase
- Keep PRs small and testable.
- Update docs when API/schema changes.
- Track open decisions in `docs/decisions.md` before implementation divergence.
