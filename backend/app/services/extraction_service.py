import json
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from openai import AsyncOpenAI
from pydantic import BaseModel, Field, ValidationError

from app.core.config import Settings
from app.schemas.expense import ExtractResponse


class _ExtractedPayload(BaseModel):
    amount: Decimal = Field(gt=0)
    category: str
    item: str
    expense_date: str
    notes: Optional[str] = None


class ExtractionService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    @staticmethod
    def parse_ai_payload(content: str, raw_transcript: str) -> ExtractResponse:
        try:
            data = json.loads(content)
            parsed = _ExtractedPayload.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="EXTRACTION_FAILED") from exc

        return ExtractResponse(
            amount=parsed.amount,
            currency="INR",
            category=parsed.category,
            item=parsed.item,
            expense_date=parsed.expense_date,
            notes=parsed.notes,
            raw_transcript=raw_transcript,
        )

    async def extract(self, transcript: str) -> ExtractResponse:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        system_prompt = (
            f"Today's date is {today}. "
            "Extract expense fields from Hindi/English input and return strict JSON with keys: "
            "amount, category, item, expense_date, notes. "
            "Use YYYY-MM-DD for expense_date. If the input says 'aaj' or 'today', use today's date. "
            "No markdown, no extra keys."
        )
        response = await self.client.responses.create(
            model=self.settings.openai_model,
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript},
            ],
        )
        text = response.output_text
        if not text:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="EXTRACTION_FAILED")
        return self.parse_ai_payload(text, transcript)
