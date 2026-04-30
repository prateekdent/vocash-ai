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

### Open Alignment Items
- Keep contracts synchronized with implemented query parameter names (`from_date`, `to_date`).
