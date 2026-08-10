"""
Email delivery service for PawMatch.
Implements an abstract EmailProvider strategy and handles rendering and dispatching of transactional emails.
"""

import logging
from abc import ABC, abstractmethod
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


class EmailService:
    """
    Service responsible for rendering transactional emails and delegating delivery to active EmailProvider.
    """

    _provider_registry = {
        "SMTP": SMTPProvider,
    }

    @classmethod
    def get_provider(cls) -> EmailProvider:
        """Instantiates active EmailProvider based on configuration."""
        backend_key = accounts_config.email_provider_backend
        provider_cls = cls._provider_registry.get(backend_key, SMTPProvider)
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
