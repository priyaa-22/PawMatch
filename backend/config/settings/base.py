"""
Base Django settings for PawMatch project.
"""

import os
import sys
from datetime import timedelta
from pathlib import Path

import environ

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Initialize django-environ
env = environ.Env()

# Environment File Resolution Strategy
settings_module = os.getenv("DJANGO_SETTINGS_MODULE", "")
if "development" in settings_module:
    target_env = ".env.development"
elif "staging" in settings_module:
    target_env = ".env.staging"
elif "production" in settings_module:
    target_env = ".env.production"
else:
    target_env = ".env"

env_file = os.path.join(BASE_DIR, target_env)
if not os.path.exists(env_file):
    env_file = os.path.join(BASE_DIR, ".env")

if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# Security Settings
SECRET_KEY = env.str(
    "SECRET_KEY",
    default="django-insecure-dev-key-change-in-production-environments-12345",
)
DEBUG = env.bool("DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["127.0.0.1", "localhost"])

# Security & Authentication Settings
AUTH_USER_MODEL = "accounts.User"

# Application Definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
]

LOCAL_APPS = [
    "apps.core.apps.CoreConfig",
    "apps.accounts.apps.AccountsConfig",
    "apps.shelters.apps.SheltersConfig",
    "apps.pets.apps.PetsConfig",
    "apps.adoptions.apps.AdoptionsConfig",
    "apps.notifications.apps.NotificationsConfig",
    "apps.administration.apps.AdministrationConfig",
    "apps.audit_logs.apps.AuditLogsConfig",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "apps.core.middleware.RequestIDMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database Configuration

IS_TESTING = "test" in sys.argv or any("pytest" in arg for arg in sys.argv)

if IS_TESTING:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DEFAULT_DB_URL = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    DATABASES = {"default": env.db("DATABASE_URL", default=DEFAULT_DB_URL)}

# Cache Configuration (Redis with LocalMemCache fallback)
REDIS_URL = env.str("REDIS_URL", default="")
if REDIS_URL and not IS_TESTING:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "pawmatch-local-cache",
        }
    }

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static & Media Files Settings
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Primary Key Default
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email Configuration (Base Placeholders & Brevo HTTPS API)
EMAIL_BACKEND = env.str(
    "EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = env.str("EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env.str("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env.str("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env.str(
    "DEFAULT_FROM_EMAIL", default="PawMatch <noreply@pawmatch.com>"
)

# Brevo HTTPS API Key & Provider Selection
BREVO_API_KEY = env.str("BREVO_API_KEY", default="")
ACCOUNTS_EMAIL_PROVIDER = env.str("ACCOUNTS_EMAIL_PROVIDER", default="BREVO_API")

# Django REST Framework (DRF) Configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
    "DEFAULT_THROTTLE_RATES": {
        "login_anon": env.str("THROTTLE_LOGIN_ANON", default="5/min"),
        "login_user": env.str("THROTTLE_LOGIN_USER", default="20/min"),
        "register_anon": env.str("THROTTLE_REGISTER_ANON", default="5/min"),
        "resend_verification": env.str("THROTTLE_RESEND_VERIFICATION", default="3/min"),
        "verify_email_otp": env.str("THROTTLE_VERIFY_EMAIL_OTP", default="5/min"),
        "password_reset": env.str("THROTTLE_PASSWORD_RESET", default="3/min"),
        "anon": "100/day",
        "user": "1000/day",
    },
}

# SimpleJWT Authentication Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# OpenAPI Schema Documentation (drf-spectacular)
SPECTACULAR_SETTINGS = {
    "TITLE": "PawMatch API",
    "DESCRIPTION": "Pet Adoption & Health Ecosystem REST API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# CORS & CSRF Defaults
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# Registration & Verification Configuration
EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES = env.int(
    "EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES", default=10
)
MAX_OTP_ATTEMPTS = env.int("MAX_OTP_ATTEMPTS", default=5)
FRONTEND_URL = env.str("FRONTEND_URL", default="http://localhost:5173")
FRONTEND_RESET_PASSWORD_URL = env.str(
    "FRONTEND_RESET_PASSWORD_URL", default=f"{FRONTEND_URL}/reset-password"
)


# Centralized Logging Setup
from .logging import get_logging_config  # noqa: E402

LOG_LEVEL = env.str("LOG_LEVEL", default="INFO")
LOG_FORMAT = env.str("LOG_FORMAT", default="json")
LOGGING = get_logging_config(BASE_DIR, LOG_LEVEL, LOG_FORMAT)
