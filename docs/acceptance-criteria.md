# Acceptance Criteria

## Auth Module
- Users can register and login with email/password.
- JWT required for protected endpoints.
- `/auth/me` returns user identity and plan status.
- Invalid token returns 401 consistently.

## Voice Extraction Module
- Transcript submission returns structured payload with required fields.
- Extraction handles Hindi/English mixed input for common spend statements.
- Invalid/ambiguous extraction path returns explicit recoverable error.
- Daily free limit is enforced for free users.

## Expense Module
- User can save manual and voice expenses.
- List endpoint supports pagination and date filtering.
- User can edit and delete own expenses only.
- Dashboard totals match saved expense data.

## Usage and Plan Module
- Usage count resets by Asia/Kolkata calendar day.
- `/usage/today` reflects accurate used/remaining values.
- Pro users are exempt from free extraction cap.

## Mobile UX Module
- Auth persists across app restarts.
- Voice flow supports record -> extract -> confirm -> save.
- Limit reached and network failure states are handled with actionable UI.
- Transactions screen renders empty and non-empty states correctly.

## Documentation Quality Gate
- Any contract/schema change includes doc updates in same change.
- Assumptions and unresolved decisions are captured in `docs/decisions.md`.
