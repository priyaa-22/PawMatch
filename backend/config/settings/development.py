"""
Development settings for PawMatch.
"""

import environ

from .base import *

DEBUG = True

# Explicitly load .env.development and override any previously loaded values
env = environ.Env()
env.read_env(BASE_DIR / ".env.development", overwrite=True)
db_url = env.str("DATABASE_URL", default="sqlite:///db.sqlite3")
if "@" in db_url:
    print("DEV DATABASE:", db_url.split("@", 1)[1])
else:
    print("DEV DATABASE: SQLite (db.sqlite3)")

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=["127.0.0.1", "localhost", "*"],
)

# Email output directed to terminal console in development
EMAIL_BACKEND = env.str(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)

# Explicit development database
DATABASES = {
    "default": env.db("DATABASE_URL", default="sqlite:///db.sqlite3"),
}

# Development CORS Settings
CORS_ALLOW_ALL_ORIGINS = env.bool(
    "CORS_ALLOW_ALL_ORIGINS",
    default=True,
)

# Verbose Development Logging
LOG_LEVEL = "DEBUG"
LOGGING = get_logging_config(BASE_DIR, LOG_LEVEL)
