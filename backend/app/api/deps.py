from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.security import decode_access_token
from app.db.mongo import get_db
from app.repositories.budget import BudgetRepository
from app.repositories.dashboard import DashboardRepository
from app.repositories.expenses import ExpenseRepository
from app.repositories.usage import UsageRepository
from app.repositories.users import UserRepository
from app.services.auth_service import AuthService
from app.services.budget_service import BudgetService
from app.services.dashboard_service import DashboardService
from app.services.expense_service import ExpenseService
from app.services.extraction_service import ExtractionService
from app.services.payment_service import PaymentService
from app.services.usage_service import UsageService

bearer = HTTPBearer(auto_error=False)


def get_user_repo(db=Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_usage_repo(db=Depends(get_db)) -> UsageRepository:
    return UsageRepository(db)


def get_expense_repo(db=Depends(get_db)) -> ExpenseRepository:
    return ExpenseRepository(db)


def get_dashboard_repo(db=Depends(get_db)) -> DashboardRepository:
    return DashboardRepository(db)


def get_budget_repo(db=Depends(get_db)) -> BudgetRepository:
    return BudgetRepository(db)


def get_auth_service(settings: Settings = Depends(get_settings)) -> AuthService:
    return AuthService(settings)


def get_usage_service(settings: Settings = Depends(get_settings)) -> UsageService:
    return UsageService(settings)


def get_extraction_service(settings: Settings = Depends(get_settings)) -> ExtractionService:
    return ExtractionService(settings)


def get_expense_service() -> ExpenseService:
    return ExpenseService()


def get_dashboard_service() -> DashboardService:
    return DashboardService()


def get_budget_service() -> BudgetService:
    return BudgetService()


def get_payment_service(settings: Settings = Depends(get_settings)) -> PaymentService:
    return PaymentService(settings)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    settings: Settings = Depends(get_settings),
    user_repo: UserRepository = Depends(get_user_repo),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    try:
        user_id = decode_access_token(credentials.credentials, settings)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = await user_repo.find_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
