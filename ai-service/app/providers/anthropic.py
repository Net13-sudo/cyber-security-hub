from app.config import ANTHROPIC_API_KEY, SYSTEM_PROMPT
from app.providers.base import AIProvider

class AnthropicProvider(AIProvider):
    def get_name(self) -> str:
        return "anthropic"

    def is_configured(self) -> bool:
        return bool(ANTHROPIC_API_KEY)

    def chat(self, message: str) -> str | None:
        if not self.is_configured():
            return None
            
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=ANTHROPIC_API_KEY)
            
            response = client.messages.create(
                model="claude-3-5-haiku-20241022",
                max_tokens=200,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": message}],
            )
            
            # Extract text from response blocks
            for block in response.content:
                if block.type == "text":
                    return block.text.strip()
            
            return None
            
        except Exception as e:
            print(f"[Anthropic] Error: {e}")
            return None
