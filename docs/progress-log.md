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

---

## 2026-05-04 (continued)

### Completed — Dashboard / Stats Screen Redesign (Phase 3)

**New component structure (`src/components/dashboard/`):**
- `DashboardSummaryHeader.tsx` — hero block: "Total Spend" label, large amount (₹ X,XXX formatted `en-IN`), month + category count subtitle.
- `SpendingProportionBar.tsx` — flex-based multi-color horizontal bar (proportional segments) + compact dot-label legend. Returns `null` when data is empty.
- `CategoryBreakdownRow.tsx` — colored dot + category name + micro 4px progress bar + muted percent + bold amount. Colors from shared `getCategoryColor`.
- `RecentTransactionRow.tsx` — read-only row: bold item name, muted date, dark bold amount. Suppresses bottom border on last item.

**Screen refactor (`DashboardScreen.tsx`):**
- `StyleSheet` extracted to `DashboardScreen.styles.ts`.
- Screen is now orchestration-only: state management, data fetching, `buildBreakdown()` (top-5 by amount + Others rollup), picker open/confirm/cancel.
- `MonthNavigator` reused from Transactions (backward-compatible; optional `onPillPress` prop added to enable the date-picker tap).
- `DashboardSummaryHeader` + `SpendingProportionBar` wrapped in a `heroBlock` View to form a seamless white zone (eliminates gray scroll gap between them).
- Section cards (`gap: 8`) give tighter row rhythm without crowding.

**ScrollView fix:**
- Added `style={{ flex: 1 }}` (`scrollView` style) to the `ScrollView` so it is properly height-constrained and scrolling works.

---

## 2026-05-04 (continued)

### Completed — Budget UI (Phase 3)

**Navigation change:**
- Introduced `MainStackNavigator` (NativeStack) wrapping the existing bottom tabs as a `Tabs` screen, with `Budget` as a sibling stack screen.
- `RootNavigator` updated to reference `MainStackNavigator`; bottom tab count unchanged at 4.
- `MainStackParamList` added to `navigation/types.ts` using `NavigatorScreenParams<MainTabParamList>` for typed nested navigation.

**Budget entry on Dashboard:**
- Section card appended at the bottom of `DashboardScreen`'s scroll: "Budget — Set monthly spending limits by category — Manage budgets →".
- Tapping navigates to `Budget` screen via `useNavigation()`.

**Budget screen (`BudgetScreen.tsx` + `BudgetScreen.styles.ts`):**
- Reads `user.is_pro` from `AuthContext` immediately; if free user renders `ProPaywall` with no API calls made.
- Pro users see `MonthNavigator` + a single card with all 10 spending categories.
- Fetches `GET /budget/status?month=YYYY-MM`; merges results with full `BUDGET_CATEGORIES` list so all 10 rows are always visible.
- Month navigation follows the same pattern as Transactions and Dashboard screens.

**`BudgetCategoryRow` component:**
- Colored category dot (reuses `getCategoryColor`), category name, chevron.
- If limit is set: fixed-height progress bar (`#F0F0F5` track, colored fill), spent/limit label, remaining or "Over by ₹X" label.
- Progress bar colors: green (< 90% spent), amber (90–99%), red (≥ 100%).
- If limit is unset: "Set limit" CTA in purple.

**`SetBudgetModal` component:**
- Bottom-sheet modal mirroring `EditTransactionModal` (slide animation, handle, backdrop dismiss, `KeyboardAvoidingView`).
- Pre-populates limit amount if one is already set for the category.
- Validates input (positive non-NaN number) before calling `POST /budget/set`.
- On success: closes modal and refreshes status.

**Pro paywall:**
- Three feature bullets, large ₹ badge icon, "Upgrade to Pro" button.
- Button navigates to Profile tab via `navigation.navigate('Tabs', { screen: 'Profile' })` — destination is the existing ProfileScreen (full payment flow deferred to Phase 4).

**New types (`types/api.ts`):**
- `BudgetStatusItem`, `BudgetStatusResponse`, `BudgetSetRequest` added.

**Doc fix (`docs/api-contracts.md`):**
- Corrected budget endpoint example category from `"Food & Dining"` (invalid) to `"Food"`.
- Added Pro-gating (`403 PRO_REQUIRED`) notes to both `/budget/set` and `/budget/status`.
- Added note explaining category string constraint and its impact on spend rollup.

### Open Items
- Category normalization: AI extracts free-text categories (`groceries`, `petrol`) that do not match chip labels (`Food`, `Transport`). Fix: normalize at extraction time in the backend prompt — tracked as a separate future slice.
- Search and category drill-down (Phase 3).
- `is_pro` freshness: upgrading mid-session requires re-login to unlock Budget UI — to be resolved in Phase 4 payment flow (re-hydrate user after Razorpay verification).
- Phase 4: Razorpay upgrade UX, limit-hit paywall, App Store submission.
