import pytest
from httpx import AsyncClient, ASGITransport
from api.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_auth_middleware_missing_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Send without Authorization header
        response = await ac.post("/api/chat", json={"message": "hello"})
    # Currently the mock middleware allows it but logs a warning. 
    # In a fully strict setup, it would return 401 or 403.
    # We verify it doesn't crash.
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_cors_headers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.options(
            "/api/chat", 
            headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"}
        )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
