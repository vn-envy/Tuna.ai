from fastapi.testclient import TestClient

from api.main import app

AUTH_HEADERS = {"Authorization": "Bearer mock_jwt_token_12345"}
client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["x-content-type-options"] == "nosniff"


def test_auth_middleware_rejects_missing_token():
    response = client.post("/api/chat", json={"message": "hello"})

    assert response.status_code == 401
    assert response.json() == {"detail": "Missing or invalid bearer token"}


def test_chat_stream_with_token_returns_sse_events():
    response = client.post("/api/chat", json={"message": "Plan Bali photo places"}, headers=AUTH_HEADERS)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert "Tuna is thinking" in response.text
    assert '"type": "done"' in response.text


def test_chat_rejects_empty_message():
    response = client.post("/api/chat", json={"message": ""}, headers=AUTH_HEADERS)

    assert response.status_code == 422


def test_cors_headers():
    response = client.options(
        "/api/chat",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"},
    )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
