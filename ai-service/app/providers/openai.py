from app.config import OPENAI_API_KEY, SYSTEM_PROMPT
from app.providers.base import AIProvider

class OpenAIProvider(AIProvider):
    def get_name(self) -> str:
        return "openai"

    def is_configured(self) -> bool:
        return bool(OPENAI_API_KEY)

    def chat(self, message: str) -> str | None:
        if not self.is_configured():
            return None
            
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message},
                ],
                max_tokens=200,
            )
            
            text = response.choices[0].message.content
            return text.strip() if text else None
            
        except Exception as e:
            # In a real app, log error here
            print(f"[OpenAI] Error: {e}")
            return None
