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
    DEFAULT_TIMEOUT = 10  # seconds

    def send_email(
        self, to_email: str, subject: str, html_content: str, text_content: str
    ) -> bool:
        api_key = getattr(settings, "BREVO_API_KEY", "")
        if not api_key:
            logger.error(
                "Failed to send email via Brevo API: BREVO_API_KEY is missing."
            )
            raise ValueError("BREVO_API_KEY environment variable is missing.")

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
