# ==============================================================================
# PawMatch Enterprise Multi-Stage Dockerfile
# Production-Hardened, Non-Root, OCI-Compliant Container Image
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Dependencies & Virtual Environment Stage
# ------------------------------------------------------------------------------
FROM python:3.13-slim AS builder

# OCI Stage Label
LABEL org.opencontainers.image.title="PawMatch Backend Builder" \
      org.opencontainers.image.description="Build stage for PawMatch Django REST API"

# Python & Pip Security Environment Flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Install OS Build Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create Virtual Environment for Clean Dependency Isolation
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Optimize Layer Caching: Copy requirements first
COPY requirements/ /build/requirements/

# Upgrade pip and install production requirements into isolated virtualenv
RUN pip install --upgrade pip && \
    pip install -r requirements/production.txt


# ------------------------------------------------------------------------------
# Stage 2: Production Execution Stage (Non-Root User)
# ------------------------------------------------------------------------------
FROM python:3.13-slim AS runner

# OCI Standard Metadata Labels
LABEL org.opencontainers.image.title="PawMatch Backend" \
      org.opencontainers.image.description="Pet Adoption & Health Ecosystem REST API Engine" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="PawMatch Engineering Team <engineering@pawmatch.com>" \
      org.opencontainers.image.source="https://github.com/Adhikulkarn/PawMatch" \
      org.opencontainers.image.licenses="MIT"

# Security & Python Runtime Flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000 \
    DJANGO_SETTINGS_MODULE=config.settings.production

# Create Dedicated Non-Root System User (appuser:appgroup, UID/GID 10001)
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

# Install Minimal OS Runtime Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Isolated Virtual Environment from Builder Stage
COPY --from=builder /opt/venv /opt/venv

# Create Application Storage Directories and Assign Non-Root Ownership
RUN mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R appuser:appgroup /app /opt/venv

# Copy Application Source Code with Non-Root Ownership
COPY --chown=appuser:appgroup . /app/

# Switch to Non-Root Application User
USER 10001:10001

# Execute Static File Collection under Non-Root User
RUN SECRET_KEY="build-time-dummy-secret-key-for-collectstatic" \
    DEBUG=False \
    ALLOWED_HOSTS="*" \
    python manage.py collectstatic --noinput

# Expose Service Port
EXPOSE 8000

# OCI Container Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Execute Database Schema Migrations and Launch Application via Gunicorn Web Server
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn -c gunicorn.conf.py config.wsgi:application"]
