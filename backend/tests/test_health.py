from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint(monkeypatch):
    async def fake_ping_db() -> bool:
        return True

    monkeypatch.setattr("app.api.routes.health.ping_db", fake_ping_db)

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": True}
