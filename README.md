# Scorpion Security Hub

Cybersecurity hub: threat intelligence, incident response, compliance, penetration testing, and client portal ? with an AI assistant and a JavaScript backend.

## Project structure

```
Scorpion-Security-hub/
??? index.html              # Splash / loading ? redirects to homepage
??? pages/                  # Main site pages
?   ??? security_command_homepage.html
?   ??? threat_intelligence_center.html
?   ??? penetration_testing.html
?   ??? incident_response_center.html
?   ??? compliance_solutions.html
?   ??? client_security_portal.html
?   ??? portfolio.html      # Software & projects
??? css/                    # Tailwind + main styles
??? js/
?   ??? ai-widget.js        # AI assistant (floating chat)
??? public/                 # Static assets
??? server/                 # Node.js API & AI backend (Express)
?   ??? src/
?   ?   ??? index.js
?   ?   ??? routes/         # health, threats, incidents, ai
?   ?   ??? data/           # In-memory data
?   ?   ??? services/       # AI (OpenAI optional)
?   ??? package.json
?   ??? .env.example
??? ai-service/              # Python AI (OpenAI, Anthropic, Gemini)
??? backend/                # Spring Boot API (optional, Java)
??? package.json            # Frontend (Tailwind, etc.)
```

## Quick start

### Frontend (website)

1. Build CSS: `npm run build:css` (or `npm run watch:css` for development).
2. Open `index.html` in a browser or use a local static server (e.g. `npx serve .`).

### Backend (Node.js ? recommended for AI)

1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and set `PORT` (default 3001). Optionally set `OPENAI_API_KEY` for live AI.
4. `npm start` or `npm run dev`

API base: `http://localhost:3001`. The AI widget on the site uses this by default (`window.SCORPION_AI_API` can override).

### Python AI (OpenAI + Anthropic + Gemini)

1. `cd ai-service` then `python -m venv .venv` and activate; `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and set at least one: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`
3. `python main.py` (port 5000). In `server/.env` set `PYTHON_AI_URL=http://localhost:5000` and restart the Node server.

See [ai-service/README.md](ai-service/README.md).

### AI assistant

- **On the site:** Use the floating AI button (bottom-right) to open the Security AI Assistant.
- **Without API:** The widget shows a connection message; start the `server` so `/api/ai/chat` is available.
- **With Python AI:** Start `ai-service` and set `PYTHON_AI_URL` in `server/.env` for OpenAI, Anthropic, and Gemini.
- **Node-only:** Set `OPENAI_API_KEY` in `server/.env` for OpenAI only; otherwise curated security tips.

## Features

- **Portfolio:** [pages/portfolio.html](pages/portfolio.html) ? **Our Software** (SIEM, ThreatScout, ComplianceHub, IAM, VaultGuard, IR Playbook) and **Our Projects** (healthcare, finance, manufacturing, critical infra, retail, government).
- **Software & projects on homepage:** Section linking to the portfolio; containers for products and delivered engagements.
- **AI:** Backend `/api/ai/chat` plus site-wide widget for security Q&A.
- **Navigation:** All main pages include Home, Services, Threat Intelligence, **Portfolio**, Client Portal, Emergency Response.

## API (Node server)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health and version |
| `/api/threat-intelligence/feeds` | GET | Threat feeds (`?limit=50`) |
| `/api/threat-intelligence/feeds/:id` | GET | Single feed |
| `/api/incidents` | GET | List incidents (`?status=&limit=`) |
| `/api/incidents` | POST | Create incident (JSON body) |
| `/api/incidents/:id/status?status=` | PATCH | Update status |
| `/api/ai/chat` | POST | AI chat (`{ "message": "..." }`) |

## Optional: Spring Boot backend

See [backend/README.md](backend/README.md). Run on port 8080; same API shape for health, threats, and incidents (no AI route there ? use the Node server for AI).

## License

MIT.
