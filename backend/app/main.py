from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.budget import router as budget_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.expense import router as expense_router
from app.api.routes.health import router as health_router
from app.api.routes.payment import router as payment_router
from app.api.routes.usage import router as usage_router

app = FastAPI(title="Vocash API", version="0.1.0")
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(usage_router)
app.include_router(expense_router)
app.include_router(dashboard_router)
app.include_router(budget_router)
app.include_router(payment_router)
