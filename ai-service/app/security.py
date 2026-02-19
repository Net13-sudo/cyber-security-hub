"""
Security-focused canned responses and fallback logic.
"""

def get_security_fallback(message: str) -> str:
    """Return a canned security response based on keywords, or a generic fallback."""
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
