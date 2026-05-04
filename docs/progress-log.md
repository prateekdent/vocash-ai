# Progress Log

## 2026-04-23

### Completed
- Backend scaffold: config loading, Mongo connection, health endpoint.
- Auth module: `/auth/register`, `/auth/login`, `/auth/me`, JWT and password hashing.
- Usage module: `/usage/today`, Asia/Kolkata day boundary utility, limit service.
- Extraction module: OpenAI wrapper, strict extract schemas, `/expense/extract`, validation tests.
- Expense module: `/expense/save`, `/expense/list`, `PUT /expense/{id}`, `DELETE /expense/{id}`, ownership checks, soft-delete flow.
- Dashboard module: `GET /dashboard/summary` with month filter, total/category/recent aggregation.
- Budget module: `POST /budget/set`, `GET /budget/status`, Pro-only gating and focused tests.
- Payment module: `POST /payment/verify`, Razorpay signature verification, Pro activation update and focused tests.
- Mobile Phase 2 slices: navigation shell, auth bootstrap/login/signup flow, voice extract-confirm-save flow, transactions list/edit/delete, usage counters, dashboard summary, centralized API error/session handling, stabilization fixes.
- Focused backend tests across implemented modules.
- Backend deployed to Railway; health check stabilised (immediate `/health`, DB-only `/health/db`).
- Real voice recording integrated (`@react-native-voice/voice`), language set to `hi-IN` with English fallback.
- Manual text input fallback added to VoiceScreen for simulator testing.
- `DISABLE_EXTRACTION_LIMIT` env flag added to bypass daily cap during testing.
- App installed and tested on a physical iPhone (Xcode free-tier signing).
- Dashboard month navigator: replaced text input with `‹ ›` arrows + month picker modal (`DateTimePicker`).

---

## 2026-05-04

### Completed — Transactions Screen Redesign (Phase 3 start)

**Bug fixes (pre-redesign):**
- Fixed month filter defaulting to current month while saved transactions were in a previous month — screen now opens on the current month with arrows to navigate backwards.
- Fixed category chip filter — switched from API-side exact match (which failed against AI free-text categories) to client-side case-insensitive filtering on loaded data.

**Modular refactor:**
- Extracted all Transactions screen logic into focused files following separation of concerns:
  - `src/utils/date.ts` — shared `monthLabel`, `firstDay`, `lastDay` helpers.
  - `components/transactions/MonthNavigator.tsx` — stateless `‹ Month Year ›` header.
  - `components/transactions/CategoryChips.tsx` — horizontal chip strip, clear selected/idle states.
  - `components/transactions/TransactionRow.tsx` — single list item with category dot, name, meta, amount, delete.
  - `components/transactions/EditTransactionModal.tsx` — bottom-sheet modal owning form state; screen owns save/error/loading.
  - `components/transactions/categoryColors.ts` — deterministic category → accent color via string hash.
  - `components/transactions/filterConstants.ts` — single source of truth for fixed `TRANSACTION_CATEGORIES` list.
  - `screens/main/TransactionsScreen.styles.ts` — screen-level styles separated from logic.
  - `screens/main/TransactionsScreen.tsx` — orchestration only (~250 lines).

**Row redesign:**
- Small colored dot per category (stable hash-based color, consistent across sessions).
- Bold item name, muted `category · date` secondary line.
- Dark bold amount (₹) right-aligned; delete icon recessed to `opacity: 0.28`.

**Filter redesign:**
- `‹ ›` month arrows replace old text filter; month change resets category chip to "All".
- Fixed hardcoded category chip list (All, Food, Transport, Shopping, Bills & Utilities, Health, Entertainment, Education, Savings & Investment, Family & Personal, Other).
- Outlined idle chip state, solid purple active chip — visually distinct.

**Edit modal:**
- Edit form moved into a `Modal` bottom-sheet (`animationType="slide"`, backdrop dismiss).
- `KeyboardAvoidingView` with `Platform.OS` branch keeps fields usable when keyboard opens.
- Drag handle, title, validation, save/cancel preserved.

### Open Items
- Category normalization: AI extracts free-text categories (`groceries`, `petrol`) that do not match chip labels (`Food`, `Transport`). Fix: normalize at extraction time in the backend prompt — tracked as a separate future slice.
- Dashboard charts and category summaries (Phase 3, next).
- Search and category drill-down (Phase 3).
- Budget UI (connects to existing backend endpoints).
