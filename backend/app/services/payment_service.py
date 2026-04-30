from datetime import datetime, timedelta, timezone
import hashlib
import hmac

from app.core.config import Settings


class PaymentService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        message = f"{order_id}|{payment_id}".encode("utf-8")
        digest = hmac.new(
            self.settings.razorpay_key_secret.encode("utf-8"),
            message,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(digest, signature)

    def pro_valid_until(self) -> datetime:
        return datetime.now(timezone.utc) + timedelta(days=self.settings.pro_plan_validity_days)
