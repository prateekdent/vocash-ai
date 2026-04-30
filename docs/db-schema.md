# Database Schema (MongoDB Atlas)

## Principles
- Document model with explicit validation at API layer.
- All user-scoped data keyed by `user_id`.
- Timestamps stored in UTC; app logic uses Asia/Kolkata for daily/monthly boundaries.

## Collections

### `users`
Purpose: identity, plan state, and account preferences.

Fields:
- `_id` (ObjectId)
- `email` (string, unique, lowercase)
- `password_hash` (string, nullable for OAuth-only users)
- `auth_provider` (enum: `email`, `google`)
- `is_pro` (bool)
- `pro_valid_until` (datetime, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

Indexes:
- unique: `email`
- index: `is_pro`

### `expenses`
Purpose: immutable financial events with optional edits.

Fields:
- `_id` (ObjectId)
- `user_id` (ObjectId, ref `users._id`)
- `amount` (decimal128 or number)
- `currency` (string, default `INR`)
- `category` (string)
- `item` (string)
- `notes` (string, nullable)
- `expense_date` (date as `YYYY-MM-DD` logical field)
- `source` (enum: `voice`, `manual`)
- `raw_transcript` (string, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)
- `is_deleted` (bool, default false)

Indexes:
- compound: `user_id + expense_date desc`
- compound: `user_id + category + expense_date`
- text (optional later): `item`, `notes`

### `usage`
Purpose: per-day voice extraction counters.

Fields:
- `_id` (ObjectId)
- `user_id` (ObjectId)
- `date` (`YYYY-MM-DD`, Asia/Kolkata day boundary)
- `extraction_count` (int)
- `updated_at` (datetime)

Indexes:
- unique compound: `user_id + date`

### `budgets`
Purpose: Pro monthly category budgets.

Fields:
- `_id` (ObjectId)
- `user_id` (ObjectId)
- `month` (`YYYY-MM`)
- `category` (string)
- `limit_amount` (number)
- `created_at` (datetime)
- `updated_at` (datetime)

Indexes:
- unique compound: `user_id + month + category`

## Relationships
- One `user` to many `expenses`.
- One `user` to many daily `usage` records.
- One `user` to many monthly `budgets`.

## Data Integrity Rules
- Expense `amount` must be positive.
- `category` must map to default set unless custom categories are explicitly enabled for Pro.
- Usage increment and extraction success should be transaction-safe at application level (atomic update in single query).
