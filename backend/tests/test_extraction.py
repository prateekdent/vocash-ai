import pytest
from fastapi import HTTPException

from app.services.extraction_service import ExtractionService, _normalize_category


def test_parse_ai_payload_success():
    raw = '{"amount": 500, "category": "Transport", "item": "Petrol", "expense_date": "2026-04-23", "notes": "fuel"}'
    result = ExtractionService.parse_ai_payload(raw, "Aaj 500 ka petrol")
    assert result.amount == 500
    assert result.category == "Transport"
    assert result.raw_transcript == "Aaj 500 ka petrol"


def test_parse_ai_payload_invalid_json_fails():
    with pytest.raises(HTTPException) as exc:
        ExtractionService.parse_ai_payload('not-json', 'x')
    assert exc.value.status_code == 422
    assert exc.value.detail == "EXTRACTION_FAILED"


def test_parse_ai_payload_invalid_schema_fails():
    bad = '{"amount": -10, "category": "Transport", "item": "Petrol", "expense_date": "2026-04-23"}'
    with pytest.raises(HTTPException) as exc:
        ExtractionService.parse_ai_payload(bad, 'x')
    assert exc.value.status_code == 422
    assert exc.value.detail == "EXTRACTION_FAILED"


# ── Category normalization ────────────────────────────────────────────────────

def test_normalize_category_exact_in_list():
    """A valid allowed category is returned unchanged."""
    assert _normalize_category("Transport") == "Transport"


def test_normalize_category_case_insensitive_match():
    """Case-insensitive match returns the correctly-cased allowed value."""
    assert _normalize_category("food") == "Food"
    assert _normalize_category("HEALTH") == "Health"
    assert _normalize_category("bills & utilities") == "Bills & Utilities"


def test_normalize_category_out_of_list_falls_back_to_other():
    """Unrecognised AI output (e.g. free-text) maps to 'Other'."""
    assert _normalize_category("Groceries") == "Other"
    assert _normalize_category("petrol") == "Other"
    assert _normalize_category("household items") == "Other"


def test_parse_ai_payload_normalizes_category():
    """parse_ai_payload applies normalization so out-of-list values become 'Other'."""
    raw = '{"amount": 200, "category": "groceries", "item": "Vegetables", "expense_date": "2026-04-23"}'
    result = ExtractionService.parse_ai_payload(raw, "200 rupees vegetables")
    assert result.category == "Other"


def test_parse_ai_payload_preserves_valid_category():
    """parse_ai_payload keeps a valid in-list category as-is."""
    raw = '{"amount": 150, "category": "food", "item": "Lunch", "expense_date": "2026-04-23"}'
    result = ExtractionService.parse_ai_payload(raw, "150 ka lunch")
    assert result.category == "Food"
