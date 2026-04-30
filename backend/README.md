# Vocash Backend (Scaffold)

## Scope
This backend currently includes only infrastructure scaffolding:
- FastAPI app bootstrap
- environment/config loading
- MongoDB connection helper
- `/health` endpoint (with Mongo ping)
- minimal pytest setup

## Run
1. `python3 -m venv .venv`
2. `source .venv/bin/activate`
3. `pip install -e .[dev]`
4. set env vars (`MONGODB_URL`, optional `MONGODB_DB_NAME`)
5. `uvicorn app.main:app --reload --host 0.0.0.0 --port 5000`

## Test
- `pytest -q`
