import asyncio
import hmac
import json
import os
import sys
import time
from collections import defaultdict, deque
from collections.abc import AsyncGenerator
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

# Load environment variables from .env file before reading configuration.
load_dotenv()

# Add the parent directory to sys.path so we can import from backend/agents when the
# API is started from either the repository root or the backend directory.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.destination_scout.tools import search_photogenic_places  # noqa: E402
from agents.orchestrator.agent import root_agent  # noqa: E402

DEFAULT_DEMO_TOKEN = "mock_jwt_token_12345"
AUTH_TOKEN = os.environ.get("API_AUTH_TOKEN", DEFAULT_DEMO_TOKEN)
REQUIRE_AUTH = os.environ.get("REQUIRE_AUTH", "true").lower() not in {"0", "false", "no"}
PUBLIC_PATHS = {"/", "/api/health", "/docs", "/openapi.json", "/redoc"}

RATE_LIMIT_MAX_REQUESTS = 15
RATE_LIMIT_WINDOW_SECONDS = 60
_rate_limit_buckets: defaultdict[str, deque[float]] = defaultdict(deque)

app = FastAPI(title="Tuna.ai API", description="Backend for Tuna.ai Travel Companion")


def _configured_origins() -> list[str]:
    raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_configured_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _is_rate_limited(request: Request) -> bool:
    now = time.monotonic()
    bucket = _rate_limit_buckets[_client_ip(request)]
    while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_MAX_REQUESTS:
        return True
    bucket.append(now)
    return False


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/api/chat" and request.method == "POST" and _is_rate_limited(request):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded"},
        )
    return await call_next(request)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response


@app.middleware("http")
async def verify_token_middleware(request: Request, call_next):
    if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    if not REQUIRE_AUTH:
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    scheme, _, token = auth_header.partition(" ")
    is_valid = scheme.lower() == "bearer" and hmac.compare_digest(token, AUTH_TOKEN)

    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Missing or invalid bearer token"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await call_next(request)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    trip_id: Optional[str] = Field(default=None, max_length=80)


def _wants_places(message: str) -> bool:
    normalized = message.lower()
    return any(term in normalized for term in ("bali", "tokyo", "place", "where", "sunset", "photo"))


def _wants_partnerships(message: str) -> bool:
    normalized = message.lower()
    return any(term in normalized for term in ("collab", "pitch", "sponsor", "brand"))


def _format_sse(event: dict[str, Any]) -> str:
    return f"data: {json.dumps(event)}\n\n"


def _fallback_agent_text(message: str) -> str:
    if _wants_places(message):
        return (
            "I found creator-friendly location ideas with golden-hour timing. "
            "Prioritize one sunrise shoot, one flexible indoor backup, and one sunset hero location."
        )
    if _wants_partnerships(message):
        return (
            "I can help package your audience, trip dates, and deliverables into a concise brand pitch. "
            "Start with one high-fit hotel or activity partner and a clear content exchange."
        )
    return "Tell me your destination, dates, creator niche, and budget, and I will shape a shoot-ready travel plan."


async def _agent_text(message: str) -> str:
    if os.environ.get("GOOGLE_API_KEY") in {None, "", "mock_key_for_now"}:
        return _fallback_agent_text(message)

    response = await asyncio.to_thread(root_agent.run, message)
    return response.text if hasattr(response, "text") else str(response)


@app.post("/api/chat")
async def chat_endpoint(chat_request: ChatRequest):
    """Stream Tuna's response and rich creator-planning cards as Server-Sent Events."""

    async def generate_response() -> AsyncGenerator[str, None]:
        yield _format_sse({"type": "status", "text": "Tuna is thinking..."})

        try:
            final_text = await _agent_text(chat_request.message)

            yield _format_sse({"type": "status", "text": "Writing..."})
            for word in final_text.split(" "):
                yield _format_sse({"type": "text", "text": f"{word} "})
                await asyncio.sleep(0.01)

            if _wants_places(chat_request.message):
                yield _format_sse({"type": "status", "text": "Scouting locations..."})
                for place in search_photogenic_places(chat_request.message):
                    if "error" not in place:
                        yield _format_sse({"type": "place_card", "data": place})
                        await asyncio.sleep(0.1)

            if _wants_partnerships(chat_request.message):
                yield _format_sse(
                    {
                        "type": "place_card",
                        "data": {
                            "name": "The St. Regis Bali Resort",
                            "type": "Brand Deal",
                            "target": "PR Director",
                            "golden_hour": "Luxury Stay",
                            "description": "Draft a two-Reel wellness pitch tied to their spa launch and your media kit.",
                        },
                    }
                )
        except Exception:
            yield _format_sse(
                {
                    "type": "text",
                    "text": "Oops! My agent brain had a glitch, but your request was received. Please try again.",
                }
            )
        finally:
            yield _format_sse({"type": "done"})

    return StreamingResponse(generate_response(), media_type="text/event-stream")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
