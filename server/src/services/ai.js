/**
 * AI Service for Scorpion Security Hub
 * 
 * Orchestrates AI responses with a localized fallback chain:
 * 1. Python AI Service (supports OpenAI, Anthropic, Gemini)
 * 2. Direct OpenAI API (legacy/backup)
 * 3. Security-focused canned responses (offline/safety fallback)
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PYTHON_AI_URL = (process.env.PYTHON_AI_URL || '').trim().replace(/\/$/, '');

// --- Canned Security Knowledge Base ---
const SECURITY_TIPS = {
  phishing: 'Phishing remains a top vector. Train staff to spot suspicious links and never share credentials.',
  ransomware: 'Back up critical data regularly and test restores. Ransomware recovery depends on it.',
  patching: 'Keep systems patched. Most breaches exploit known vulnerabilities that have fixes available.',
  mfa: 'For stronger security, enable MFA on all critical accounts and use a password manager.',
  incident: 'Have an incident response plan and run tabletop exercises so the team knows their roles.',
  network: 'Segment your network so a compromise in one area does not expose the entire organization.',
  monitoring: 'Monitor logs and set up alerts for unusual logins, data access, or configuration changes.',
  privilege: 'Use the principle of least privilege: grant only the access users need to do their jobs.',
  default: 'For stronger security, enable MFA on critical accounts, keep systems patched, and have an incident response plan.',
};

const KEYWORD_MAP = [
  { keys: ['phish', 'email'], category: 'phishing' },
  { keys: ['backup', 'ransom'], category: 'ransomware' },
  { keys: ['patch', 'update'], category: 'patching' },
  { keys: ['mfa', 'password'], category: 'mfa' },
  { keys: ['incident', 'response'], category: 'incident' },
  { keys: ['network', 'segment'], category: 'network' },
  { keys: ['monitor', 'log'], category: 'monitoring' },
  { keys: ['privilege', 'access'], category: 'privilege' },
];

function getCannedReply(message) {
  const lower = message.toLowerCase();
  for (const item of KEYWORD_MAP) {
    if (item.keys.some(k => lower.includes(k))) {
      return SECURITY_TIPS[item.category];
    }
  }
  // Random fallback if no keyword match
  const values = Object.values(SECURITY_TIPS);
  return values[Math.floor(Math.random() * values.length)];
}

// --- Provider Implementations ---

async function callPythonAi(message, provider) {
  if (!PYTHON_AI_URL) throw new Error('Python AI URL not configured');

  const res = await fetch(`${PYTHON_AI_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, provider }),
  });

  if (!res.ok) {
    throw new Error(`Python AI Service error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.reply;
}

async function callOpenAI(message) {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a concise cybersecurity assistant for Scorpion Security Hub. Answer in 2–4 sentences. Focus on practical security advice, threats, and best practices.',
        },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

// --- Main Orchestrator ---

async function getAiResponse(message, provider = 'auto') {
  if (!message || typeof message !== 'string') {
    return getCannedReply('');
  }

  // 1. Try Python AI Service
  if (PYTHON_AI_URL) {
    try {
      const reply = await callPythonAi(message, provider);
      if (reply && reply.trim()) return reply.trim();
    } catch (err) {
      console.warn(`[AI] Python service failed: ${err.message}`);
    }
  }

  // 2. Try Direct OpenAI (Fallback)
  if (OPENAI_API_KEY && (provider === 'auto' || provider === 'openai')) {
    try {
      const reply = await callOpenAI(message);
      if (reply && reply.trim()) return reply.trim();
    } catch (err) {
      console.warn(`[AI] OpenAI failed: ${err.message}`);
    }
  }

  // 3. Fallback to Canned Responses (silent fallback)
  return getCannedReply(message);
}

module.exports = { getAiResponse };
