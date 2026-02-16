# Scorpion Security Hub — Node.js backend

Express API for the Scorpion Security Hub: health, threat intelligence, incidents, and **AI chat**.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env: PORT (default 3001), optional OPENAI_API_KEY
```

## Run

```bash
npm start          # Production
npm run dev        # Development with --watch
```

Server: **http://localhost:3001**

## API

- `GET /api/health` — Health and version
- `GET /api/threat-intelligence/feeds?limit=50` — Threat feeds
- `GET /api/threat-intelligence/feeds/:id` — One feed
- `GET /api/incidents?status=&limit=` — List incidents
- `POST /api/incidents` — Create incident (JSON: title, description, severity, assignedTo)
- `PATCH /api/incidents/:id/status?status=CLOSED` — Update status
- `POST /api/ai/chat` — AI chat body: `{ "message": "..." }` → `{ "reply": "..." }`

## AI

- Without `OPENAI_API_KEY`: responses are curated security tips (no external API).
- With `OPENAI_API_KEY` in `.env`: uses OpenAI for live replies. Do not commit the key.

The frontend AI widget calls `http://localhost:3001/api/ai/chat` by default. Override with `window.SCORPION_AI_API = 'https://your-api.com/api'` before loading the widget.
