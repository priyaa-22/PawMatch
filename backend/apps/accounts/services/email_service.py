"""
Email delivery service for PawMatch.
Implements an abstract EmailProvider strategy and handles rendering and dispatching of transactional emails.
"""

import json
import logging
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from email.utils import parseaddr
from typing import Any, Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from apps.accounts.config import accounts_config
from apps.accounts.constants import EmailTemplate

logger = logging.getLogger("apps.accounts")


class EmailProvider(ABC):
    """Abstract provider strategy interface for email delivery."""

    @abstractmethod
    def send_email(
        self, to_email: str, subject: str, html_content: str, text_content: str
    ) -> bool:
        """Dispatches email with HTML and plain text alternatives."""
        pass


class SMTPProvider(EmailProvider):
    """Concrete SMTP email delivery provider using Django mail engine."""

    def send_email(
        self, to_email: str, subject: str, html_content: str, text_content: str
    ) -> bool:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return True


class BrevoAPIProvider(EmailProvider):
    """
    Concrete Brevo Transactional Email HTTPS API provider.
    Dispatches transactional emails via Brevo REST API v3 over HTTPS.
    Avoids outbound SMTP port blocking issues on cloud platforms (e.g. Render Free).
    """

    API_URL = "https://api.brevo.com/v3/smtp/email"
    ACCOUNT_URL = "https://api.brevo.com/v3/account"
    DEFAULT_TIMEOUT = 10  # seconds

    def _get_api_key(self) -> str:
        """Retrieves trimmed BREVO_API_KEY from settings."""
        return getattr(settings, "BREVO_API_KEY", "").strip()

    def test_connection(self) -> dict:
        """
        Safely tests Brevo API key authentication and network connectivity using GET /v3/account.
        Distinguishes missing key, 401 Unauthorized, network errors, and 200 OK without leaking keys.
        """
        api_key = self._get_api_key()
        if not api_key:
            logger.warning(
                "Brevo connectivity check failed: BREVO_API_KEY environment variable is missing."
            )
            return {
                "success": False,
                "status_code": 400,
                "reason": "missing_api_key",
                "message": "BREVO_API_KEY environment variable is missing or empty.",
            }

        logger.info(
            "Executing Brevo API connection test",
            extra={"configured": True, "key_length": len(api_key)},
        )

        headers = {
            "api-key": api_key,
            "Accept": "application/json",
        }

        req = urllib.request.Request(
            url=self.ACCOUNT_URL,
            headers=headers,
            method="GET",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.DEFAULT_TIMEOUT) as response:
                if response.status == 200:
                    logger.info("Brevo API connectivity & credentials verified successfully.")
                    return {
                        "success": True,
                        "status_code": 200,
                        "reason": "valid_credentials",
                        "message": "Brevo API credentials authenticated successfully.",
                    }
                return {
                    "success": False,
                    "status_code": response.status,
                    "reason": "unexpected_status",
                    "message": f"Brevo API returned unexpected HTTP status code: {response.status}",
                }
        except urllib.error.HTTPError as exc:
            if exc.code == 401:
                logger.error(
                    "Brevo API authentication check failed (401 Unauthorized). Check BREVO_API_KEY setting."
                )
                return {
                    "success": False,
                    "status_code": 401,
                    "reason": "invalid_api_key",
                    "message": "Brevo API authentication failed (401 Unauthorized). Key is invalid or revoked.",
                }
            logger.error(f"Brevo API check HTTPError {exc.code}: {exc.reason}")
            return {
                "success": False,
                "status_code": exc.code,
                "reason": "http_error",
                "message": f"Brevo API connection failed with status code {exc.code}: {exc.reason}",
            }
        except urllib.error.URLError as exc:
            logger.error(f"Brevo API check URLError: {exc.reason}")
            return {
                "success": False,
                "status_code": 503,
                "reason": "network_failure",
                "message": f"Brevo API network connection failed: {exc.reason}",
            }
        except Exception as exc:
            logger.error(f"Brevo API check unexpected error: {exc}")
            return {
                "success": False,
                "status_code": 500,
                "reason": "unexpected_error",
                "message": "Unexpected error occurred while checking Brevo API credentials.",
            }

    def send_email(
        self, to_email: str, subject: str, html_content: str, text_content: str
    ) -> bool:
        api_key = self._get_api_key()
        if not api_key:
            logger.error(
                "Failed to send email via Brevo API: BREVO_API_KEY is missing."
            )
            raise ValueError("BREVO_API_KEY environment variable is missing.")

        logger.info(
            "Dispatching email via Brevo API provider",
            extra={"configured": True, "key_length": len(api_key)},
        )

        sender_name, sender_email = parseaddr(settings.DEFAULT_FROM_EMAIL)
        if not sender_email:
            sender_email = "noreply@pawmatch.com"
        if not sender_name:
            sender_name = "PawMatch"

        payload = {
            "sender": {
                "name": sender_name,
                "email": sender_email,
            },
            "to": [
                {
                    "email": to_email,
                }
            ],
            "subject": subject,
            "htmlContent": html_content,
            "textContent": text_content,
        }

        headers = {
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url=self.API_URL,
            data=data,
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self.DEFAULT_TIMEOUT) as response:
                if response.status in (200, 201, 202):
                    return True
                logger.error(f"Brevo API returned HTTP status code: {response.status}")
                return False
        except urllib.error.HTTPError as exc:
            error_body = (
                exc.read().decode("utf-8", errors="replace")
                if hasattr(exc, "read")
                else ""
            )
            if exc.code == 401:
                logger.error(
                    "Brevo API HTTPError 401: Unauthorized. Please check BREVO_API_KEY setting."
                )
                raise RuntimeError(
                    "Brevo API request failed with status 401: Unauthorized"
                ) from exc
            logger.error(
                f"Brevo API HTTPError {exc.code}: {exc.reason}. Body: {error_body}"
            )
            raise RuntimeError(
                f"Brevo API request failed with status {exc.code}: {exc.reason}"
            ) from exc
        except urllib.error.URLError as exc:
            logger.error(f"Brevo API URLError: {exc.reason}")
            raise RuntimeError(
                f"Brevo API network connection failed: {exc.reason}"
            ) from exc
        except Exception as exc:
            logger.error(f"Brevo API unexpected failure: {exc}")
            raise


class EmailService:
    """
    Service responsible for rendering transactional emails and delegating delivery to active EmailProvider.
    """

    _provider_registry = {
        "SMTP": SMTPProvider,
        "BREVO_API": BrevoAPIProvider,
        "BREVO": BrevoAPIProvider,
    }

    @classmethod
    def get_provider(cls) -> EmailProvider:
        """Instantiates active EmailProvider based on configuration."""
        backend_key = accounts_config.email_provider_backend
        provider_cls = cls._provider_registry.get(backend_key, BrevoAPIProvider)
        return provider_cls()

    @classmethod
    def test_provider_connection(cls) -> dict:
        """Runs connectivity & credential verification on active EmailProvider."""
        provider = cls.get_provider()
        if hasattr(provider, "test_connection"):
            return provider.test_connection()
        return {
            "success": True,
            "status_code": 200,
            "reason": "provider_not_testable",
            "message": f"Active provider {provider.__class__.__name__} does not require/support connectivity verification.",
        }


    @classmethod
    def send_verification_otp_email(
        cls, user: Any, raw_otp: str, request: Optional[Any] = None
    ) -> bool:
        """
        Renders and dispatches 6-digit email verification OTP email.
        """
        context = {
            "first_name": user.first_name,
            "otp": raw_otp,
            "otp_expiry_minutes": (
                accounts_config.email_verification_otp_expiry_minutes
            ),
        }

        subject = "Your PawMatch Verification Code"
        html_content = render_to_string(EmailTemplate.VERIFICATION_EMAIL, context)
        text_content = strip_tags(html_content)

        try:
            provider = cls.get_provider()
            provider.send_email(
                to_email=user.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

            logger.info(
                "Verification OTP email successfully dispatched",
                extra={"user_id": str(user.id), "email": user.email},
            )
            return True
        except Exception as exc:
            logger.error(
                f"Failed to dispatch verification OTP email to {user.email}: {exc}",
                extra={"user_id": str(user.id), "email": user.email},
                exc_info=True,
            )
            return False

    @classmethod
    def send_welcome_email(cls, user: Any, request: Optional[Any] = None) -> bool:
        """
        Renders and dispatches welcome email upon successful account activation.
        """
        login_url = f"{accounts_config.frontend_url}/login"
        context = {
            "first_name": user.first_name,
            "login_url": login_url,
        }

        subject = "Welcome to PawMatch!"
        html_content = render_to_string(EmailTemplate.WELCOME_EMAIL, context)
        text_content = strip_tags(html_content)

        try:
            provider = cls.get_provider()
            provider.send_email(
                to_email=user.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

            logger.info(
                "Welcome email successfully dispatched",
                extra={"user_id": str(user.id), "email": user.email},
            )
            return True
        except Exception as exc:
            logger.error(
                f"Failed to dispatch welcome email to {user.email}: {exc}",
                extra={"user_id": str(user.id), "email": user.email},
                exc_info=True,
            )
            return False

    @classmethod
    def send_password_reset_email(
        cls, user: Any, raw_token: str, request: Optional[Any] = None
    ) -> bool:
        """
        Renders and dispatches password reset link email.
        """
        reset_url = f"{accounts_config.frontend_reset_password_url}?token={raw_token}"
        context = {
            "first_name": user.first_name,
            "reset_url": reset_url,
            "token_expiry_hours": accounts_config.password_reset_expiry_hours,
        }

        subject = "Reset your PawMatch Password"
        html_content = render_to_string(EmailTemplate.PASSWORD_RESET_EMAIL, context)
        text_content = strip_tags(html_content)

        try:
            provider = cls.get_provider()
            provider.send_email(
                to_email=user.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

            logger.info(
                "Password reset email successfully dispatched",
                extra={"user_id": str(user.id), "email": user.email},
            )
            return True
        except Exception as exc:
            logger.error(
                f"Failed to dispatch password reset email to {user.email}: {exc}",
                extra={"user_id": str(user.id), "email": user.email},
                exc_info=True,
            )
            return False

    @classmethod
    def send_password_changed_email(
        cls, user: Any, request: Optional[Any] = None
    ) -> bool:
        """
        Renders and dispatches password change security confirmation email.
        """
        context = {
            "first_name": user.first_name,
            "timestamp": timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        }

        subject = "Security Alert: PawMatch Password Changed"
        html_content = render_to_string(EmailTemplate.PASSWORD_CHANGED_EMAIL, context)
        text_content = strip_tags(html_content)

        try:
            provider = cls.get_provider()
            provider.send_email(
                to_email=user.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

            logger.info(
                "Password changed notification email successfully dispatched",
                extra={"user_id": str(user.id), "email": user.email},
            )
            return True
        except Exception as exc:
            logger.error(
                f"Failed to dispatch password changed email to {user.email}: {exc}",
                extra={"user_id": str(user.id), "email": user.email},
                exc_info=True,
            )
            return False
