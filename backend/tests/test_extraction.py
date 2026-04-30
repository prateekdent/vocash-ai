import pytest
from fastapi import HTTPException

from app.services.extraction_service import ExtractionService


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
