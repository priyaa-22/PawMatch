# Master Environment Variables Specification

```text
Document ID:     DEPLOYMENT-ENVIRONMENT_VARIABLES
Status:          Approved Specification
Version:         1.1
Document Owner:  PawMatch Architecture & Engineering Team
Last Updated:    July 30, 2026
```

---

## 1. Overview & File Resolution Strategy

PawMatch follows 12-Factor App methodology for configuration management. Environment settings are decoupled from application code and read via `django-environ`.

### Dynamic Resolution Mechanism
When Django initializes, `config/settings/base.py` selects the environment file based on `DJANGO_SETTINGS_MODULE`:

| `DJANGO_SETTINGS_MODULE` | Selected Env File | Storage Purpose |
| :--- | :--- | :--- |
| `config.settings.development` | `.env.development` | Local development variables & dev Neon PostgreSQL URI |
| `config.settings.staging` | `.env.staging` | Pre-production staging configuration |
| `config.settings.production` | `.env.production` | Hardened production settings (overridden by Render Dashboard) |
| *Unspecified / Fallback* | `.env` | Local override file |

---

## 2. Environment Variable Catalog

| Variable Name | Required | Default / Sample | Description |
| :--- | :---: | :--- | :--- |
| `SECRET_KEY` | Yes | `[Cryptographic Hash]` | Django cryptographic signing key |
| `DEBUG` | No | `False` | Toggles development debugging and tracebacks |
| `ALLOWED_HOSTS` | Yes | `127.0.0.1,localhost,.onrender.com` | Comma-separated allowed HTTP Host headers |
| `DATABASE_URL` | Yes | `postgres://user:pass@host:5432/db` | PostgreSQL connection string (Neon / Render) |
| `REDIS_URL` | No | `redis://:pass@host:6379/0` | Redis URI for caching and Celery task broker |
| `EMAIL_HOST` | No | `smtp.sendgrid.net` | SMTP gateway host |
| `EMAIL_PORT` | No | `587` | SMTP gateway port |
| `EMAIL_HOST_USER` | No | `apikey` | SMTP account username / API key |
| `BREVO_API_KEY` | Yes (Prod) | `xkeysib-...` | Brevo Transactional Email API key for HTTPS dispatch |
| `ACCOUNTS_EMAIL_PROVIDER` | No | `BREVO_API` | Active email provider (`BREVO_API` or `SMTP`) |
| `DEFAULT_FROM_EMAIL` | No | `PawMatch <noreply@pawmatch.com>` | Outbound transactional sender address |
| `JWT_ACCESS_LIFETIME` | No | `15` | JWT Access Token duration in minutes |
| `JWT_REFRESH_LIFETIME` | No | `7` | JWT Refresh Token duration in days |
| `LOG_LEVEL` | No | `INFO` | Logging severity threshold (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `LOG_FORMAT` | No | `json` | Logging output format (`json` for CloudWatch/Loki, `text` for dev) |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://pawmatch.com` | Whitelisted origins for cross-site requests |
| `CSRF_TRUSTED_ORIGINS` | Yes | `https://pawmatch.com` | Trusted origins for CSRF validation |
| `SECURE_SSL_REDIRECT` | No | `True` | Forces HTTPS redirection in staging/prod |
| `GUNICORN_WORKERS` | No | `(cpu_count * 2) + 1` | Gunicorn worker process count |
| `GUNICORN_THREADS` | No | `4` | Gunicorn threads per worker |
| `GUNICORN_TIMEOUT` | No | `60` | Worker timeout in seconds |
| `GUNICORN_GRACEFUL_TIMEOUT` | No | `30` | Graceful worker shutdown timeout |

---

## 3. Git Security & Exclusion Policy

- **Tracked Files**: Only `.env.example` containing dummy placeholder values is committed to version control.
- **Ignored Files**: All real `.env`, `.env.development`, `.env.staging`, `.env.production`, and `.env.*` files are strictly excluded via `.gitignore`.
- **Render Vault**: In production and staging, sensitive variables (`SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`) are populated directly in the Render Dashboard environment vault.
