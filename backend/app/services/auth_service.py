from fastapi import HTTPException, status

from app.core.config import Settings
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import AuthResponse, UserPublic


class AuthService:
    def __init__(self, settings: Settings):
        self.settings = settings

    @staticmethod
    def _to_public(user: dict) -> UserPublic:
        return UserPublic(
            id=str(user["_id"]),
            email=user["email"],
            is_pro=bool(user.get("is_pro", False)),
            created_at=user["created_at"],
        )

    async def register(self, user_repo, email: str, password: str) -> AuthResponse:
        existing = await user_repo.find_by_email(email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        user = await user_repo.create(email=email, password_hash=hash_password(password))
        token = create_access_token(str(user["_id"]), self.settings)
        return AuthResponse(user=self._to_public(user), access_token=token)

    async def login(self, user_repo, email: str, password: str) -> AuthResponse:
        user = await user_repo.find_by_email(email)
        if not user or not verify_password(password, user["password_hash"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        token = create_access_token(str(user["_id"]), self.settings)
        return AuthResponse(user=self._to_public(user), access_token=token)
