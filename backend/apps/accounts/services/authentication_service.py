"""
Authentication domain service layer for PawMatch.
Encapsulates user authentication, credential validation, token generation, token blacklisting,
and security audit trail recording.
"""

import logging
from typing import Any, Dict, Tuple

from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.constants import AuditAction, AuthMessage
from apps.accounts.events import EventDispatcher
from apps.accounts.exceptions import (
    AccountDisabledException,
    AuthenticationException,
)
from apps.accounts.models import User
from apps.accounts.utils import normalize_email_address
from apps.audit_logs.services.audit_service import AuditService

logger = logging.getLogger("apps.accounts")


class AuthenticationService:
    """
    Domain service executing authentication business logic and security audit logging.
    """

    @classmethod
    def authenticate_user(
        cls, email: str, password: str, request: Any = None
    ) -> Tuple[User, Dict[str, str]]:
        """
        Authenticates user credentials, verifies account status, generates JWT tokens,
        updates last login timestamp, and records structured audit logs.
        """
        normalized_email = normalize_email_address(email)

        user = authenticate(request=request, email=normalized_email, password=password)

        if user is None:
            # Fallback check to distinguish inactive user from bad credentials
            try:
                existing_user = User.objects.get(email=normalized_email)
                if (
                    existing_user.check_password(password)
                    and not existing_user.is_active
                ):
                    AuditService.log_event(
                        action=AuditAction.LOGIN_FAILED_DISABLED,
                        request=request,
                        user_id=existing_user.id,
                        email=normalized_email,
                        status="FAILED",
                        details={"reason": AuthMessage.ACCOUNT_DISABLED},
                    )
                    raise AccountDisabledException(AuthMessage.ACCOUNT_DISABLED)
            except User.DoesNotExist:
                pass

            AuditService.log_event(
                action=AuditAction.LOGIN_FAILED_CREDENTIALS,
                request=request,
                email=normalized_email,
                status="FAILED",
                details={"reason": AuthMessage.INVALID_CREDENTIALS},
            )
            raise AuthenticationException(AuthMessage.INVALID_CREDENTIALS)

        if not user.is_active:
            AuditService.log_event(
                action=AuditAction.LOGIN_FAILED_DISABLED,
                request=request,
                user_id=user.id,
                email=user.email,
                status="FAILED",
                details={"reason": AuthMessage.ACCOUNT_DISABLED},
            )
            raise AccountDisabledException(AuthMessage.ACCOUNT_DISABLED)

        # Generate SimpleJWT token pair
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Update last_login timestamp
        update_last_login(None, user)

        EventDispatcher.dispatch_user_logged_in(
            user_id=user.id, email=user.email, request=request
        )

        AuditService.log_event(
            action=AuditAction.LOGIN_SUCCESS,
            request=request,
            user_id=user.id,
            email=user.email,
            status="SUCCESS",
        )

        tokens = {
            "access": access_token,
            "refresh": refresh_token,
        }
        return user, tokens

    @classmethod
    def logout_user(
        cls, refresh_token_str: str, user: Any = None, request: Any = None
    ) -> None:
        """
        Blacklists the provided refresh token and records audit log.
        """
        if not refresh_token_str:
            AuditService.log_event(
                action=AuditAction.LOGOUT_FAILED,
                request=request,
                user_id=getattr(user, "id", None),
                email=getattr(user, "email", ""),
                status="FAILED",
                details={"reason": AuthMessage.REFRESH_TOKEN_REQUIRED},
            )
            raise ValidationError({"refresh": [AuthMessage.REFRESH_TOKEN_REQUIRED]})

        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()

            user_id = getattr(user, "id", None)
            email = getattr(user, "email", "")

            EventDispatcher.dispatch_user_logged_out(
                user_id=user_id, email=email, request=request
            )

            AuditService.log_event(
                action=AuditAction.LOGOUT_SUCCESS,
                request=request,
                user_id=user_id,
                email=email,
                status="SUCCESS",
            )
        except TokenError as exc:
            AuditService.log_event(
                action=AuditAction.LOGOUT_FAILED,
                request=request,
                user_id=getattr(user, "id", None),
                email=getattr(user, "email", ""),
                status="FAILED",
                details={"reason": AuthMessage.TOKEN_INVALID_OR_EXPIRED},
            )
            raise ValidationError(
                {"refresh": [AuthMessage.TOKEN_INVALID_OR_EXPIRED]}
            ) from exc
