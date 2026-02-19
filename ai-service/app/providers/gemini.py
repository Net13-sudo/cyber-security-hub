from app.config import GEMINI_API_KEY, SYSTEM_PROMPT
from app.providers.base import AIProvider

class GeminiProvider(AIProvider):
    def get_name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(GEMINI_API_KEY)

    def chat(self, message: str) -> str | None:
        if not self.is_configured():
            return None
            
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            
            model = genai.GenerativeModel("gemini-1.5-flash")
            # Gemini system prompt is often passed in the generation config or pre-pended
            full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {message}"
            
            response = model.generate_content(
                full_prompt, 
                generation_config={"max_output_tokens": 200}
            )
            
            return response.text.strip() if response.text else None
            
        except Exception as e:
            print(f"[Gemini] Error: {e}")
            return None
