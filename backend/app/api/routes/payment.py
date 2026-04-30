from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, get_payment_service, get_user_repo
from app.schemas.payment import PaymentVerifyRequest, PaymentVerifyResponse

router = APIRouter(prefix="/payment", tags=["payment"])


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(
    payload: PaymentVerifyRequest,
    current_user: dict = Depends(get_current_user),
    user_repo=Depends(get_user_repo),
    payment_service=Depends(get_payment_service),
) -> PaymentVerifyResponse:
    is_valid = payment_service.verify_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="INVALID_SIGNATURE")

    valid_until = payment_service.pro_valid_until()
    await user_repo.activate_pro(str(current_user["_id"]), valid_until)

    return PaymentVerifyResponse(
        verified=True,
        plan="pro",
        valid_until=valid_until.date().isoformat(),
    )
