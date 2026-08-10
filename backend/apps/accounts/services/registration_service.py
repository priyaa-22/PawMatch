"""
Domain registration service layer for PawMatch.
Encapsulates user registration, 6-digit OTP generation, email verification via OTP,
and resending verification OTPs with security audit trails.
"""

import logging
from datetime import timedelta
from typing import Any, Optional, Tuple

from django.db import transaction
from django.utils import timezone

from apps.accounts.config import accounts_config
from apps.accounts.constants import AuditAction, AuthMessage
from apps.accounts.events import EventDispatcher
from apps.accounts.exceptions import (
    EmailAlreadyVerifiedException,
    ExpiredOTPException,
    InvalidOTPException,
    MaxOTPAttemptsExceededException,
    RegistrationException,
)
from apps.accounts.models import EmailVerificationOTP, User
from apps.accounts.services.email_service import EmailService
from apps.accounts.utils import generate_secure_otp, normalize_email_address
from apps.accounts.validators import validate_email_unique
from apps.audit_logs.services.audit_service import AuditService

logger = logging.getLogger("apps.accounts")


class RegistrationService:
    """
    Domain service executing user onboarding and 6-digit email verification OTP logic.
    """

    @classmethod
    def generate_email_verification_otp(
        cls,
        user: User,
    ) -> Tuple[EmailVerificationOTP, str]:
        """
        Generates a 6-digit numeric OTP, computes its SHA-256 hash,
        persists the EmailVerificationOTP model, and returns (otp_instance, raw_otp).
        Raw OTP strings are NEVER stored in the database.
        """
        raw_otp = generate_secure_otp(6)
        otp_hash = EmailVerificationOTP.hash_otp(raw_otp)
        expires_at = timezone.now() + timedelta(
            minutes=accounts_config.email_verification_otp_expiry_minutes
        )

        otp_obj = EmailVerificationOTP.objects.create(
            user=user,
            otp_hash=otp_hash,
            expires_at=expires_at,
            max_attempts=accounts_config.max_otp_attempts,
            is_active=True,
        )
        return otp_obj, raw_otp

    @classmethod
    @transaction.atomic
    def register_user(
        cls,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        request: Optional[Any] = None,
    ) -> Tuple[User, EmailVerificationOTP, str]:
        """
        Registers a new inactive user, generates a 6-digit email verification OTP,
        dispatches a verification email, and logs a security audit record.
        """
        normalized_email = validate_email_unique(email)

        user = User.objects.create_user(
            email=normalized_email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            is_active=False,
            is_email_verified=False,
        )

        otp_obj, raw_otp = cls.generate_email_verification_otp(user)

        EmailService.send_verification_otp_email(
            user=user, raw_otp=raw_otp, request=request
        )

        EventDispatcher.dispatch_user_registered(
            user_id=user.id, email=user.email, request=request
        )

        AuditService.log_event(
            action=AuditAction.REGISTRATION_SUCCESS,
            request=request,
            user_id=user.id,
            email=user.email,
            status="SUCCESS",
        )

        return user, otp_obj, raw_otp

    @classmethod
    def verify_email_otp(
        cls, email: str, raw_otp: str, request: Optional[Any] = None
    ) -> User:
        """
        Validates the submitted 6-digit OTP against stored SHA-256 hash,
        activates the user account, marks the OTP as consumed, dispatches welcome email,
        and records audit trails. Protects against brute-force attacks via attempt counters.
        """
        if not email or not raw_otp:
            AuditService.log_event(
                action=AuditAction.OTP_VERIFICATION_FAILED,
                request=request,
                status="FAILED",
                details={"reason": "Missing email or OTP parameter."},
            )
            raise InvalidOTPException(
                "Email address and verification code are required."
            )

        normalized_email = normalize_email_address(email)
        user = User.objects.filter(email=normalized_email).first()

        if not user:
            AuditService.log_event(
                action=AuditAction.OTP_VERIFICATION_FAILED,
                request=request,
                status="FAILED",
                details={"reason": "User non-existent."},
            )
            raise InvalidOTPException(AuthMessage.INVALID_OTP)

        if user.is_email_verified:
            AuditService.log_event(
                action=AuditAction.OTP_VERIFICATION_FAILED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={"reason": AuthMessage.EMAIL_ALREADY_VERIFIED},
            )
            raise EmailAlreadyVerifiedException(AuthMessage.EMAIL_ALREADY_VERIFIED)

        otp_obj = (
            EmailVerificationOTP.objects.filter(user=user, is_active=True)
            .order_by("-created_at")
            .first()
        )

        if not otp_obj:
            AuditService.log_event(
                action=AuditAction.OTP_VERIFICATION_FAILED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={"reason": "No active OTP found."},
            )
            raise InvalidOTPException(AuthMessage.INVALID_OTP)

        if otp_obj.is_expired():
            otp_obj.is_active = False
            otp_obj.save(update_fields=["is_active", "updated_at"])
            AuditService.log_event(
                action=AuditAction.OTP_EXPIRED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={"reason": AuthMessage.EXPIRED_OTP},
            )
            raise ExpiredOTPException(AuthMessage.EXPIRED_OTP)

        if otp_obj.has_exceeded_attempts():
            otp_obj.is_active = False
            otp_obj.save(update_fields=["is_active", "updated_at"])
            AuditService.log_event(
                action=AuditAction.OTP_MAX_ATTEMPTS_EXCEEDED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={"reason": AuthMessage.MAX_OTP_ATTEMPTS},
            )
            raise MaxOTPAttemptsExceededException(AuthMessage.MAX_OTP_ATTEMPTS)

        submitted_hash = EmailVerificationOTP.hash_otp(raw_otp.strip())
        if submitted_hash != otp_obj.otp_hash:
            attempts = otp_obj.increment_attempts()
            AuditService.log_event(
                action=AuditAction.OTP_VERIFICATION_FAILED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={
                    "attempts": attempts,
                    "max_attempts": otp_obj.max_attempts,
                },
            )
            if attempts >= otp_obj.max_attempts:
                raise MaxOTPAttemptsExceededException(AuthMessage.MAX_OTP_ATTEMPTS)
            raise InvalidOTPException(AuthMessage.INVALID_OTP)

        # OTP is valid — activate account and mark OTP as used atomically
        with transaction.atomic():
            user.is_active = True
            user.is_email_verified = True
            user.save(update_fields=["is_active", "is_email_verified"])

            otp_obj.mark_as_used()

            # Invalidate any other active OTPs for this user
            EmailVerificationOTP.objects.filter(user=user, is_active=True).update(
                is_active=False
            )

        EmailService.send_welcome_email(user=user, request=request)

        EventDispatcher.dispatch_email_verified(
            user_id=user.id, email=user.email, request=request
        )

        AuditService.log_event(
            action=AuditAction.OTP_VERIFICATION_SUCCESS,
            request=request,
            user_id=user.id,
            email=user.email,
            status="SUCCESS",
        )

        return user

    @classmethod
    @transaction.atomic
    def resend_verification_otp(cls, email: str, request: Optional[Any] = None) -> bool:
        """
        Invalidates previous active OTPs, generates a fresh 6-digit OTP,
        dispatches a verification email, and logs an audit record.
        """
        normalized_email = normalize_email_address(email)
        user = User.objects.filter(email=normalized_email).first()

        if not user:
            AuditService.log_event(
                action=AuditAction.RESEND_VERIFICATION_FAILED,
                request=request,
                email=normalized_email,
                status="FAILED",
                details={"reason": AuthMessage.USER_NOT_FOUND},
            )
            raise RegistrationException({"email": [AuthMessage.USER_NOT_FOUND]})

        if user.is_email_verified:
            AuditService.log_event(
                action=AuditAction.RESEND_VERIFICATION_FAILED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={"reason": AuthMessage.EMAIL_ALREADY_VERIFIED},
            )
            raise EmailAlreadyVerifiedException(
                {"email": [AuthMessage.EMAIL_ALREADY_VERIFIED]}
            )

        # Invalidate previous unused active OTPs
        EmailVerificationOTP.objects.filter(user=user, is_active=True).update(
            is_active=False
        )

        otp_obj, raw_otp = cls.generate_email_verification_otp(user)

        EmailService.send_verification_otp_email(
            user=user, raw_otp=raw_otp, request=request
        )

        AuditService.log_event(
            action=AuditAction.OTP_RESENT,
            request=request,
            user_id=user.id,
            email=user.email,
            status="SUCCESS",
        )

        return True
