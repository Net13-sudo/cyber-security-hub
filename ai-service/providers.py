"""
AI providers: OpenAI, Anthropic (Claude), Google Gemini.
Each returns a string reply or raises an exception.
"""
from __future__ import annotations

from config import (
    ANTHROPIC_API_KEY,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
    SYSTEM_PROMPT,
)


def _fallback_reply(message: str) -> str:
    """Security-focused fallback when no provider is configured or all fail."""
    lower = message.lower()
    if "phish" in lower or "email" in lower:
        return "Phishing remains a top vector. Train staff to spot suspicious links and never share credentials."
    if "backup" in lower or "ransom" in lower:
        return "Back up critical data regularly and test restores. Ransomware recovery depends on it."
    if "patch" in lower or "update" in lower:
        return "Keep systems patched. Most breaches exploit known vulnerabilities that have fixes available."
    if "mfa" in lower or "password" in lower:
        return "For stronger security, enable MFA on all critical accounts and use a password manager."
    if "incident" in lower or "response" in lower:
        return "Have an incident response plan and run tabletop exercises so the team knows their roles."
    if "network" in lower or "segment" in lower:
        return "Segment your network so a compromise in one area does not expose the entire organization."
    if "monitor" in lower or "log" in lower:
        return "Monitor logs and set up alerts for unusual logins, data access, or configuration changes."
    if "privilege" in lower or "access" in lower:
        return "Use the principle of least privilege: grant only the access users need to do their jobs."
    return (
        "For stronger security, enable MFA on critical accounts, keep systems patched, "
        "and have an incident response plan. Need more specific advice? Ask about a topic."
    )


def call_openai(message: str) -> str:
    if not OPENAI_API_KEY:
        return _fallback_reply(message)
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    r = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        max_tokens=200,
    )
    text = (r.choices and r.choices[0].message and r.choices[0].message.content) or ""
    return text.strip() or _fallback_reply(message)


def call_anthropic(message: str) -> str:
    if not ANTHROPIC_API_KEY:
        return _fallback_reply(message)
    from anthropic import Anthropic

    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    r = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=200,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": message}],
    )
    if not r.content or not isinstance(r.content, list):
        return _fallback_reply(message)
    for block in r.content:
        if getattr(block, "type", None) == "text":
            return (getattr(block, "text", None) or "").strip()
    return _fallback_reply(message)


def call_gemini(message: str) -> str:
    if not GEMINI_API_KEY:
        return _fallback_reply(message)
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"{SYSTEM_PROMPT}\n\nUser: {message}"
    config = {"max_output_tokens": 200}
    r = model.generate_content(prompt, generation_config=config)
    if not r:
        return _fallback_reply(message)
    try:
        text = r.text
    except (ValueError, AttributeError):
        return _fallback_reply(message)
    return (text or "").strip() or _fallback_reply(message)


def get_available_providers() -> list[str]:
    out = []
    if OPENAI_API_KEY:
        out.append("openai")
    if ANTHROPIC_API_KEY:
        out.append("anthropic")
    if GEMINI_API_KEY:
        out.append("gemini")
    return out


def chat(message: str, provider: str | None = None) -> str:
    """
    Get AI reply. provider in ('openai','anthropic','gemini','auto').
    'auto' uses first available in order: openai -> anthropic -> gemini.
    """
    message = (message or "").strip()
    if not message:
        return "Please ask a short security-related question."

    order = ["openai", "anthropic", "gemini"]
    if provider and provider.lower() == "auto":
        provider = None
    if provider:
        provider = provider.lower()
        if provider not in order:
            provider = None

    to_try = [provider] if provider else order
    for p in to_try:
        if p == "openai" and not OPENAI_API_KEY:
            continue
        if p == "anthropic" and not ANTHROPIC_API_KEY:
            continue
        if p == "gemini" and not GEMINI_API_KEY:
            continue
        try:
            if p == "openai":
                return call_openai(message)
            if p == "anthropic":
                return call_anthropic(message)
            if p == "gemini":
                return call_gemini(message)
        except Exception:
            continue
    return _fallback_reply(message)
