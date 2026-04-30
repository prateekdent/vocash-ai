from pydantic import BaseModel, Field


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str = Field(min_length=1)
    razorpay_payment_id: str = Field(min_length=1)
    razorpay_signature: str = Field(min_length=1)


class PaymentVerifyResponse(BaseModel):
    verified: bool
    plan: str
    valid_until: str
