/**
 * AI chat: prefers Python AI service (Anthropic, Gemini, OpenAI) when
 * PYTHON_AI_URL is set; else uses OpenAI if OPENAI_API_KEY is set;
 * otherwise returns security-focused canned responses.
 */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || ''; // e.g. http://localhost:5000

const SECURITY_TIPS = [
  'For stronger security, enable MFA on all critical accounts and use a password manager.',
  'Keep systems patched. Most breaches exploit known vulnerabilities that have fixes available.',
  'Phishing remains a top vector. Train staff to spot suspicious links and never share credentials.',
  'Segment your network so a compromise in one area does not expose the entire organization.',
  'Back up critical data regularly and test restores. Ransomware recovery depends on it.',
  'Use the principle of least privilege: grant only the access users need to do their jobs.',
  'Monitor logs and set up alerts for unusual logins, data access, or configuration changes.',
  'Have an incident response plan and run tabletop exercises so the team knows their roles.',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCannedReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('phish') || lower.includes('email')) return SECURITY_TIPS[2];
  if (lower.includes('backup') || lower.includes('ransom')) return SECURITY_TIPS[4];
  if (lower.includes('patch') || lower.includes('update')) return SECURITY_TIPS[1];
  if (lower.includes('mfa') || lower.includes('password')) return SECURITY_TIPS[0];
  if (lower.includes('incident') || lower.includes('response')) return SECURITY_TIPS[7];
  if (lower.includes('network') || lower.includes('segment')) return SECURITY_TIPS[3];
  if (lower.includes('monitor') || lower.includes('log')) return SECURITY_TIPS[6];
  if (lower.includes('privilege') || lower.includes('access')) return SECURITY_TIPS[5];
  return pickRandom(SECURITY_TIPS);
}

async function callPythonAi(message, provider, baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, provider }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Python AI ${res.status}`);
  }
  const data = await res.json();
  return (data.reply && data.reply.trim()) || getCannedReply(message);
}

async function callOpenAI(message) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise cybersecurity assistant for Scorpion Security Hub. Answer in 2–4 sentences. Focus on practical security advice, threats, and best practices.',
        },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `OpenAI ${res.status}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || getCannedReply(message);
}

async function getAiResponse(message, provider = 'auto') {
  const pythonAiUrl = (PYTHON_AI_URL || '').trim();
  if (pythonAiUrl) {
    try {
      return await callPythonAi(message, provider, pythonAiUrl);
    } catch (err) {
      console.error('Python AI failed, falling back:', err.message);
    }
  }
  if (OPENAI_API_KEY) {
    try {
      return await callOpenAI(message);
    } catch (err) {
      console.error('OpenAI failed:', err.message);
    }
  }
  return Promise.resolve(getCannedReply(message));
}

module.exports = { getAiResponse };
