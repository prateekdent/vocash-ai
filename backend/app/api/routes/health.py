from fastapi import APIRouter

from app.db.mongo import ping_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@router.get("/health/db")
async def health_db() -> dict:
    db_ok = await ping_db()
    return {"status": "ok", "db": db_ok}
