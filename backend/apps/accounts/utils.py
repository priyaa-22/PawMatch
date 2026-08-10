"""
Common utility functions for PawMatch Accounts & Authentication module.
Consolidates token hashing, token generation, email normalization, and client metadata parsing.
"""

import hashlib
import secrets
from typing import Any, Optional, Tuple

from apps.accounts.config import accounts_config


def hash_token(raw_token: str) -> str:
    """Computes a SHA-256 hash of the raw token string for secure storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_secure_raw_token(length: Optional[int] = None) -> str:
    """Generates a cryptographically secure URL-safe raw token string."""
    num_bytes = length or accounts_config.default_token_bytes
    return secrets.token_urlsafe(num_bytes)


def generate_secure_otp(digits: int = 6) -> str:
    """
    Generates a cryptographically secure numeric OTP string formatted with leading zeros.
    """
    max_val = 10**digits
    number = secrets.randbelow(max_val)
    return f"{number:0{digits}d}"


def normalize_email_address(email: str) -> str:
    """Strips whitespace and lowercases email address."""
    return email.strip().lower() if email else ""


def extract_client_ip(request: Any) -> Optional[str]:
    """Extracts client IP address handling reverse proxy headers."""
    if not request:
        return None
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def parse_user_agent_details(user_agent_str: str) -> Tuple[str, str, str]:
    """Parses User-Agent header string into (Browser, OS, Device Type)."""
    if not user_agent_str:
        return ("Unknown", "Unknown", "Unknown")

    ua = user_agent_str.lower()

    # Browser Detection
    if "edg" in ua:
        browser = "Edge"
    elif "chrome" in ua and "chromium" not in ua:
        browser = "Chrome"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "opera" in ua or "opr" in ua:
        browser = "Opera"
    else:
        browser = "Other"

    # OS Detection
    if "windows" in ua:
        os_name = "Windows"
    elif "macintosh" in ua or "mac os" in ua:
        os_name = "macOS"
    elif "android" in ua:
        os_name = "Android"
    elif "iphone" in ua or "ipad" in ua or "ipod" in ua:
        os_name = "iOS"
    elif "linux" in ua:
        os_name = "Linux"
    else:
        os_name = "Other"

    # Device Type Detection
    if "ipad" in ua or "tablet" in ua:
        device_type = "Tablet"
    elif "mobile" in ua or "iphone" in ua or "android" in ua:
        device_type = "Mobile"
    else:
        device_type = "Desktop"

    return (browser, os_name, device_type)
