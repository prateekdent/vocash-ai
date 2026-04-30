# API Contracts (MVP v1)

Base URL (local): `http://localhost:5000`
Auth: `Authorization: Bearer <jwt>`
Content-Type: `application/json`

## Auth

### POST `/auth/register`
Request:
```json
{ "email": "user@example.com", "password": "StrongPassword123" }
```
Response 201:
```json
{ "user": { "id": "u1", "email": "user@example.com", "is_pro": false }, "access_token": "jwt", "token_type": "bearer" }
```

### POST `/auth/login`
Request:
```json
{ "email": "user@example.com", "password": "StrongPassword123" }
```
Response 200: same shape as register.

### GET `/auth/me`
Response 200:
```json
{ "id": "u1", "email": "user@example.com", "is_pro": false, "created_at": "2026-04-23T00:00:00Z" }
```

## Expense Extraction and Save

### POST `/expense/extract`
Request:
```json
{ "transcript": "Aaj 500 ka petrol bhara" }
```
Response 200:
```json
{
  "amount": 500,
  "currency": "INR",
  "category": "Transport",
  "item": "Petrol",
  "expense_date": "2026-04-23",
  "notes": null,
  "raw_transcript": "Aaj 500 ka petrol bhara"
}
```
Errors:
- `429 LIMIT_REACHED` for free users after daily cap.
- `422 EXTRACTION_FAILED` when model output is invalid.

### POST `/expense/save`
Request:
```json
{
  "amount": 500,
  "currency": "INR",
  "category": "Transport",
  "item": "Petrol",
  "expense_date": "2026-04-23",
  "notes": "Fuel refill",
  "source": "voice",
  "raw_transcript": "Aaj 500 ka petrol bhara"
}
```
Response 201:
```json
{ "id": "e1", "user_id": "u1", "created_at": "2026-04-23T07:00:00Z" }
```

## Expense CRUD

### GET `/expense/list?from=2026-04-01&to=2026-04-30&category=Transport&page=1&page_size=20`
Response 200:
```json
{
  "items": [
    { "id": "e1", "amount": 500, "category": "Transport", "item": "Petrol", "expense_date": "2026-04-23", "source": "voice" }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 1 }
}
```
Note: implemented query params are `from_date` and `to_date`.

### PUT `/expense/{id}`
Request: same editable fields as save.
Response 200: `{ "id": "e1", "updated": true }`

### DELETE `/expense/{id}`
Response 200: `{ "id": "e1", "deleted": true }`

## Dashboard and Usage

### GET `/dashboard/summary?month=2026-04`
Response 200:
```json
{
  "month": "2026-04",
  "total_spend": 12500,
  "currency": "INR",
  "category_breakdown": [
    { "category": "Food & Dining", "amount": 4200, "percent": 33.6 }
  ],
  "recent": [
    { "id": "e1", "item": "Petrol", "amount": 500, "expense_date": "2026-04-23" }
  ]
}
```
If `month` is omitted, backend defaults to current month in `YYYY-MM`.

### GET `/usage/today`
Response 200:
```json
{ "date": "2026-04-23", "used": 2, "limit": 3, "is_pro": false, "remaining": 1 }
```

## Payments and Budgets

### POST `/payment/verify`
Request:
```json
{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_123",
  "razorpay_signature": "sig_123"
}
```
Response 200:
```json
{ "verified": true, "plan": "pro", "valid_until": "2026-05-23" }
```
Errors:
- `400 INVALID_SIGNATURE` when Razorpay signature check fails.
Notes:
- Signature is validated via HMAC-SHA256 over `razorpay_order_id|razorpay_payment_id` using backend secret.
- On success, backend marks the authenticated user as Pro and updates `pro_valid_until`.

### POST `/budget/set`
Request:
```json
{ "month": "2026-04", "category": "Food & Dining", "limit_amount": 6000 }
```
Response 200: `{ "saved": true }`

### GET `/budget/status?month=2026-04`
Response 200:
```json
{
  "month": "2026-04",
  "items": [
    { "category": "Food & Dining", "limit_amount": 6000, "spent_amount": 4200, "remaining": 1800 }
  ]
}
```
