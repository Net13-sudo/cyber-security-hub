from typing import List, Optional

from app.providers.base import AIProvider
from app.providers.openai import OpenAIProvider
from app.providers.anthropic import AnthropicProvider
from app.providers.gemini import GeminiProvider
from app.security import get_security_fallback

class AIService:
    def __init__(self):
        self.providers: List[AIProvider] = [
            OpenAIProvider(),
            AnthropicProvider(),
            GeminiProvider()
        ]

    def get_available_providers(self) -> List[str]:
        return [p.get_name() for p in self.providers if p.is_configured()]

    def chat(self, message: str, provider_name: Optional[str] = None) -> str:
        """
        Orchestrate the chat request.
        If provider_name is specified, try that one.
        If 'auto' or None, try all configured providers in order.
        If all fail, return security fallback.
        """
        if not message or not message.strip():
            return "Please ask a short security-related question."

        # Determine which providers to try
        to_try = []
        
        if provider_name and provider_name.lower() != "auto":
            # Find specific provider
            found = next((p for p in self.providers if p.get_name() == provider_name.lower()), None)
            if found and found.is_configured():
                to_try.append(found)
        else:
            # Try all configured
            to_try = [p for p in self.providers if p.is_configured()]

        # Attempt to get a response
        for provider in to_try:
            response = provider.chat(message)
            if response:
                return response

        # Fallback if no provider succeeded
        return get_security_fallback(message)

# Global instance
ai_service = AIService()
