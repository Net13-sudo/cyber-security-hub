"""Load env and provider API keys."""
import os
from pathlib import Path

from dotenv import load_dotenv

# Load from parent of 'app' directory (which is ai-service root)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

SYSTEM_PROMPT = (
    "You are a concise cybersecurity assistant for Scorpion Security Hub. "
    "Answer in 2–4 sentences. Focus on practical security advice, threats, and best practices."
)
