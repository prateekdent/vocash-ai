from fastapi import APIRouter, Depends

from app.api.deps import get_auth_service, get_current_user, get_user_repo
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    user_repo=Depends(get_user_repo),
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    return await auth_service.register(user_repo=user_repo, email=payload.email, password=payload.password)


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    user_repo=Depends(get_user_repo),
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    return await auth_service.login(user_repo=user_repo, email=payload.email, password=payload.password)


@router.get("/me", response_model=UserPublic)
async def me(current_user: dict = Depends(get_current_user)) -> UserPublic:
    return UserPublic(
        id=str(current_user["_id"]),
        email=current_user["email"],
        is_pro=bool(current_user.get("is_pro", False)),
        created_at=current_user["created_at"],
    )
