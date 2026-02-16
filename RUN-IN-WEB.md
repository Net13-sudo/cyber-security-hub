# How to Run Scorpion Security Hub in the Web

Use **two terminals**: one for the **website**, one for the **API**. The site talks to the API at `http://localhost:3001/api`.

---

## Option A: Website + Node API (recommended minimum)

### Terminal 1 – Build CSS and serve the website

```powershell
cd c:\Users\Net14\Documents\PROGRAMMS\Scorpion-Security-hub

npm install
npm run serve
```

*(Or run `npm run build:css` then `npx serve . -l 3000` separately.)*

- Website: **http://localhost:3000**
- Open **http://localhost:3000** in your browser (splash → homepage).  
- The AI widget will call the Node API; without Python AI it uses built-in security tips.

### Terminal 2 – Node API (required for AI and data)

```powershell
cd c:\Users\Net14\Documents\PROGRAMMS\Scorpion-Security-hub\server

npm install
copy .env.example .env
node src\index.js
```

- API: **http://localhost:3001**
- Leave this running while you use the site.

**Result:** Open **http://localhost:3000** in the browser. You can use the site and the AI assistant (canned tips or OpenAI if you set `OPENAI_API_KEY` in `server\.env`).

---

## Option B: Website + Node API + Python AI (OpenAI / Anthropic / Gemini)

Do **Option A** first, then add the Python AI service.

### Terminal 3 – Python AI service

```powershell
cd c:\Users\Net14\Documents\PROGRAMMS\Scorpion-Security-hub\ai-service

python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `ai-service\.env` and set at least one key:

```env
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
GEMINI_API_KEY=...
```

Then run:

```powershell
python main.py
```

- Python AI: **http://localhost:5000**

Edit `server\.env` and add:

```env
PYTHON_AI_URL=http://localhost:5000
```

Restart the Node server (Terminal 2): stop it (Ctrl+C), then run `node src\index.js` again.

**Result:** The AI assistant on the site will use OpenAI, Anthropic, or Gemini via the Python service.

---

## Quick reference

| What              | Command / URL |
|-------------------|---------------|
| **Website**       | Terminal 1: `npx serve . -l 3000` → open **http://localhost:3000** |
| **Node API**      | Terminal 2: `node src\index.js` in `server\` → **http://localhost:3001** |
| **Python AI**     | Terminal 3: `python main.py` in `ai-service\` → **http://localhost:5000** (optional) |

---

## If you don’t use `serve`

- You can open `index.html` directly in the browser (double-click or drag into Chrome/Edge).
- The AI widget may not work if the page is loaded as `file://` (browser blocks requests to `localhost`).  
- To avoid that, always use a local server for the site, e.g. `npx serve . -l 3000`, and open **http://localhost:3000**.

---

## Port summary

| Port  | Service      |
|-------|--------------|
| 3000  | Website (frontend) |
| 3001  | Node API (used by the site and AI widget) |
| 5000  | Python AI (optional, used by Node when `PYTHON_AI_URL` is set) |
