# Scorpion Security Hub — Python AI Service

Python AI backend with **OpenAI**, **Anthropic (Claude)**, and **Google Gemini**. Use one or all; the API picks the first available or the one you request.

## Requirements

- Python 3.10+
- At least one API key (OpenAI, Anthropic, or Gemini)

## Setup

```bash
cd ai-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and set one or more keys:
#   OPENAI_API_KEY=sk-...
#   ANTHROPIC_API_KEY=sk-ant-...
#   GEMINI_API_KEY=...
```

## Run

```bash
# Default port 5000
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 5000

# Development with reload
RELOAD=true python main.py
```

Server: **http://localhost:5000**

## API

| Endpoint       | Method | Description |
|----------------|--------|-------------|
| `/health`      | GET    | Status and which providers have keys configured |
| `/providers`   | GET    | List of configured providers (`openai`, `anthropic`, `gemini`) |
| `/chat`        | POST   | Chat with AI |

### POST /chat

Body (JSON):

```json
{
  "message": "How do I protect against ransomware?",
  "provider": "auto"
}
```

- **message** (required): User question.
- **provider** (optional): `"openai"` | `"anthropic"` | `"gemini"` | `"auto"` (default).  
  `"auto"` uses the first available provider in order: OpenAI → Anthropic → Gemini.

Response:

```json
{
  "reply": "Back up critical data regularly and test restores..."
}
```

## Integration with Node server

The Node.js server (`server/`) can proxy chat to this Python service:

1. Start the Python AI service (e.g. on port 5000).
2. In `server/.env` set:
   ```
   PYTHON_AI_URL=http://localhost:5000
   ```
3. Start the Node server. The site’s AI widget will then use OpenAI, Anthropic, and Gemini via this Python service.

If `PYTHON_AI_URL` is not set, the Node server falls back to its own OpenAI/canned logic.

## Providers

- **OpenAI** — `openai` package; model: `gpt-4o-mini`.
- **Anthropic** — `anthropic` package; model: `claude-3-5-haiku-20241022`.
- **Gemini** — `google-generativeai` package; model: `gemini-1.5-flash`.

If no key is set for a provider, that provider is skipped. If all fail or none are configured, the service returns a security-focused fallback reply.

Do not commit `.env` or API keys.
