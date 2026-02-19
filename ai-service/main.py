"""
Scorpion Security Hub - Python AI Service
FastAPI server that routes chat to OpenAI, Anthropic, or Gemini.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import from new package structure
from app.services import ai_service


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    provider: str | None = Field(default="auto", description="openai | anthropic | gemini | auto")


class ChatResponse(BaseModel):
    reply: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Scorpion Security Hub AI",
    description="Multi-provider AI chat (OpenAI, Anthropic, Gemini)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "scorpion-ai",
        "providers_configured": ai_service.get_available_providers(),
    }


@app.post("/chat", response_model=ChatResponse)
def post_chat(body: ChatRequest):
    try:
        # Use simple method on the service instance
        reply = ai_service.chat(body.message, body.provider)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/providers")
def list_providers():
    return {"providers": ai_service.get_available_providers()}


def run():
    import uvicorn
    port = int(os.getenv("PORT", "5000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=os.getenv("RELOAD", "").lower() == "true")


if __name__ == "__main__":
    run()
