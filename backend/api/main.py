import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Add the parent directory to sys.path so we can import from agents
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.orchestrator.agent import root_agent

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Tuna.ai API", description="Backend for Tuna.ai Travel Companion")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup for frontend
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

from typing import Optional

# Mock Auth Middleware to demonstrate security feature
@app.middleware("http")
async def verify_token_middleware(request: Request, call_next):
    # Allow health check and preflight requests without token
    if request.url.path == "/api/health" or request.method == "OPTIONS":
        return await call_next(request)
        
    # Check for Authorization header
    auth_header = request.headers.get("Authorization")
    
    # In a real app we would use:
    # decoded_token = auth.verify_id_token(token)
    # But for the hackathon MVP, we just check if it's our mock token
    if not auth_header or not auth_header.startswith("Bearer mock_jwt_token_12345"):
        # For ease of testing during hackathon demo, we don't strictly reject, 
        # but we log the security check
        print("Auth Warning: Missing or invalid token. Allowing through for MVP demo.")
        
    response = await call_next(request)
    return response

class ChatRequest(BaseModel):
    message: str
    trip_id: Optional[str] = None
    
# Mock data for phase 1
mock_places = [
    {
        "id": "p1",
        "name": "Uluwatu Temple",
        "type": "Attraction",
        "rating": 4.8,
        "golden_hour": "17:30 - 18:30",
        "description": "Cliff-top temple with stunning ocean views, perfect for sunset content."
    },
    {
        "id": "p2",
        "name": "Tegallalang Rice Terrace",
        "type": "Attraction",
        "rating": 4.7,
        "golden_hour": "06:00 - 07:00",
        "description": "Iconic tiered rice paddies. Best shot early morning to avoid crowds and harsh shadows."
    }
]

@app.post("/api/chat")
@limiter.limit("15/minute")
async def chat_endpoint(request: Request, chat_request: ChatRequest):
    """
    Streaming chat endpoint for the Clicky-inspired companion panel.
    Now connected to the real Google ADK root_agent.
    """
    async def generate_response():
        # Status update
        yield f"data: {json.dumps({'type': 'status', 'text': 'Tuna is thinking...'})}\n\n"
        
        try:
            # 1. Run the ADK Agent
            response = root_agent.run(chat_request.message)
            
            # The agent's response could contain text and potentially tool execution results.
            # ADK agent.run returns a response object which has text.
            final_text = response.text if hasattr(response, 'text') else str(response)
            
            # 2. Check if the prompt implied looking for places and we should inject a place card
            # In a full integration, we'd intercept the tool's return value.
            # For this MVP, we will run the tool directly here if the agent didn't format it right,
            # or just stream the text.
            
            # Stream the text word by word for the Clicky effect
            yield f"data: {json.dumps({'type': 'status', 'text': 'Writing...'})}\n\n"
            for word in final_text.split(" "):
                yield f"data: {json.dumps({'type': 'text', 'text': word + ' '})}\n\n"
                await asyncio.sleep(0.02)
                
            # As a showcase of the "Depth" tool calling, we will manually trigger the tool here
            # to guarantee the UI gets a rich card, since extracting raw tool calls from ADK's 
            # abstraction layer can be complex in a 2-hour window.
            from agents.destination_scout.tools import search_photogenic_places
            
            if "bali" in chat_request.message.lower() or "tokyo" in chat_request.message.lower() or "place" in chat_request.message.lower() or "where" in chat_request.message.lower():
                yield f"data: {json.dumps({'type': 'status', 'text': 'Scouting locations...'})}\n\n"
                places = search_photogenic_places(chat_request.message)
                
                for place in places:
                    if "error" not in place:
                        yield f"data: {json.dumps({'type': 'place_card', 'data': place})}\n\n"
                        await asyncio.sleep(0.5)
            
            # Yield a partnership pitch card if asked
            if "collab" in chat_request.message.lower() or "pitch" in chat_request.message.lower() or "sponsor" in chat_request.message.lower():
                mock_pitch = {
                    "name": "The St. Regis Bali Resort",
                    "type": "Brand Deal",
                    "target": "PR Director",
                    "golden_hour": "Luxury Stay",
                    "description": "They just launched a new Ayurvedic spa. I've drafted a pitch offering 2 Reels for a comped stay."
                }
                yield f"data: {json.dumps({'type': 'place_card', 'data': mock_pitch})}\n\n"

        except Exception as e:
             yield f"data: {json.dumps({'type': 'text', 'text': f'Oops! My agent brain had a glitch: {str(e)}'})}\n\n"
             
        # Done
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        
    return StreamingResponse(generate_response(), media_type="text/event-stream")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
