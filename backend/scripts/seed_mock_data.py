"""
Seed script — pushes realistic mock expenses for the current month.

Usage:
    cd backend
    python scripts/seed_mock_data.py \
        --email your@email.com \
        --password yourpassword \
        [--base-url http://localhost:5000] \
        [--month 2026-05]

The script logs in, obtains a JWT, then POSTs each expense to /expense/save.
No backend changes required.
"""

import argparse
import json
import sys
from datetime import date, timedelta

import urllib.request
import urllib.error


# ── Mock data ─────────────────────────────────────────────────────────────────
# Each entry: (day_offset_from_month_start, item, category, amount, notes)
MOCK_EXPENSES = [
    (1,  "Grocery shopping",          "Food",                  850,   "Weekly vegetables and fruits"),
    (1,  "Auto rickshaw",             "Transport",              60,   None),
    (2,  "Coffee at Starbucks",       "Food",                  450,   None),
    (2,  "Mobile recharge",           "Bills & Utilities",     299,   "Jio prepaid"),
    (3,  "Petrol",                    "Transport",             500,   "Full tank"),
    (4,  "Lunch with colleagues",     "Food",                  380,   None),
    (4,  "Uber ride",                 "Transport",             220,   "Late night cab"),
    (5,  "Electricity bill",          "Bills & Utilities",    1200,   "May bill"),
    (6,  "Netflix subscription",      "Entertainment",         649,   None),
    (6,  "Snacks",                    "Food",                  120,   None),
    (7,  "Clothes shopping",          "Shopping",             2500,   "Summer clothes"),
    (8,  "Doctor consultation",       "Health",                600,   "General checkup"),
    (8,  "Pharmacy",                  "Health",                340,   "Medicine"),
    (9,  "Dinner out",                "Food",                  750,   "Restaurant with family"),
    (9,  "Metro card recharge",       "Transport",             200,   None),
    (10, "Online course",             "Education",            1999,   "Udemy course"),
    (11, "Milk and bread",            "Food",                   85,   None),
    (11, "Gym membership",            "Health",                800,   "Monthly fee"),
    (12, "Amazon purchase",           "Shopping",             1350,   "Earphones"),
    (13, "Birthday gift",             "Family & Personal",     500,   "Friend's birthday"),
    (14, "Petrol",                    "Transport",             500,   "Full tank"),
    (14, "Weekly groceries",          "Food",                  920,   None),
    (15, "Internet bill",             "Bills & Utilities",     799,   "Broadband"),
    (15, "Swiggy order",              "Food",                  320,   "Dinner delivery"),
    (16, "Movie tickets",             "Entertainment",         400,   "Weekend movie"),
    (17, "Cab to airport",            "Transport",             650,   None),
    (18, "Restaurant lunch",          "Food",                  480,   None),
    (19, "Mutual fund SIP",           "Savings & Investment", 5000,   "Monthly SIP"),
    (20, "Vegetables",                "Food",                  180,   None),
    (20, "Haircut",                   "Family & Personal",     200,   None),
    (21, "Petrol",                    "Transport",             500,   None),
    (22, "Breakfast cafe",            "Food",                  210,   None),
    (23, "School fee",                "Education",            3500,   "Tuition fee"),
    (24, "Groceries",                 "Food",                  700,   None),
    (25, "Water purifier service",    "Bills & Utilities",     350,   "Annual maintenance"),
    (26, "Dinner delivery",           "Food",                  290,   "Zomato"),
    (27, "Weekend outing",            "Entertainment",         1200,  "Day trip expenses"),
    (28, "Medicines",                 "Health",                420,   None),
    (28, "Vegetables and fruits",     "Food",                  250,   None),
    (29, "Cab",                       "Transport",             180,   None),
    (30, "Groceries",                 "Food",                  860,   None),
]


# ── HTTP helpers (stdlib only — no requests dependency) ───────────────────────

def post_json(url: str, payload: dict, token=None) -> dict:
    body = json.dumps(payload).encode()
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        print(f"  HTTP {e.code}: {detail}", file=sys.stderr)
        raise


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Seed mock expenses")
    parser.add_argument("--email",    required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--base-url", default="http://localhost:5001")
    parser.add_argument("--month",    default=None,
                        help="YYYY-MM to seed into (default: current month)")
    args = parser.parse_args()

    base = args.base_url.rstrip("/")

    # Resolve target month
    if args.month:
        year, month = map(int, args.month.split("-"))
    else:
        today = date.today()
        year, month = today.year, today.month

    month_start = date(year, month, 1)
    print(f"Seeding expenses for {year}-{month:02d} into {base}\n")

    # Login
    print("Logging in ...", end=" ", flush=True)
    auth = post_json(f"{base}/auth/login", {"email": args.email, "password": args.password})
    token = auth["access_token"]
    print("OK")

    # Seed
    saved = 0
    for (day_offset, item, category, amount, notes) in MOCK_EXPENSES:
        expense_date = month_start + timedelta(days=day_offset - 1)
        # Skip if the date falls outside the target month
        if expense_date.month != month:
            continue

        payload = {
            "amount":       amount,
            "currency":     "INR",
            "category":     category,
            "item":         item,
            "expense_date": expense_date.isoformat(),
            "notes":        notes,
            "source":       "manual",
            "raw_transcript": None,
        }
        try:
            post_json(f"{base}/expense/save", payload, token=token)
            print(f"  ✓  {expense_date}  {item:<35}  ₹{amount}")
            saved += 1
        except Exception:
            print(f"  ✗  {expense_date}  {item}  — skipped")

    print(f"\nDone. {saved}/{len(MOCK_EXPENSES)} expenses saved.")


if __name__ == "__main__":
    main()
