"""
Comprehensive unit and integration test suite for PawMatch Password Management:
Authenticated Password Change, Forgot Password Workflow, Token-Based Password Reset,
Security Email Notifications, and Audit Trails.
"""

from datetime import timedelta
from unittest.mock import MagicMock

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.events import (
    password_changed_signal,
    password_reset_completed_signal,
    password_reset_requested_signal,
)
from apps.accounts.models import AccountToken, AccountTokenType
from apps.accounts.services.password_service import PasswordService
from apps.audit_logs.models import AuditLog

User = get_user_model()


class TestPasswordManagement(APITestCase):
    """Test suite for Change Password, Forgot Password, and Reset Password APIs."""

    def setUp(self):
        try:
            cache.clear()
        except Exception:
            pass

        self.orig_provider = getattr(settings, "ACCOUNTS_EMAIL_PROVIDER", "BREVO_API")
        settings.ACCOUNTS_EMAIL_PROVIDER = "SMTP"

        self.old_password = "OldPassword123!"
        self.new_password = "NewStrongPassword123!"
        self.user = User.objects.create_user(
            email="pwduser@example.com",
            password=self.old_password,
            first_name="Password",
            last_name="Tester",
            is_active=True,
            is_email_verified=True,
        )

        self.change_pwd_url = reverse("accounts:change_password")
        self.forgot_pwd_url = reverse("accounts:forgot_password")
        self.reset_pwd_url = reverse("accounts:reset_password")

    def tearDown(self):
        try:
            cache.clear()
        except Exception:
            pass
        settings.ACCOUNTS_EMAIL_PROVIDER = self.orig_provider

    def test_change_password_success(self):
        """Tests authenticated user changing password updates user hash, dispatches email, event signal, and audit log."""
        self.client.force_authenticate(user=self.user)
        mock_handler = MagicMock()
        password_changed_signal.connect(mock_handler)
        mail.outbox.clear()

        payload = {
            "current_password": self.old_password,
            "new_password": self.new_password,
            "confirm_password": self.new_password,
        }

        response = self.client.post(self.change_pwd_url, payload, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

        self.user.refresh_from_db()
        assert self.user.check_password(self.new_password) is True

        assert len(mail.outbox) == 1
        assert "Security Alert: PawMatch Password Changed" in mail.outbox[0].subject

        assert mock_handler.called is True
        password_changed_signal.disconnect(mock_handler)

        audit_entry = AuditLog.objects.filter(action="PASSWORD_CHANGED").first()
        assert audit_entry is not None

    def test_change_password_incorrect_current_password(self):
        """Tests change password with wrong current password returns HTTP 400 error."""
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": "WrongPassword123!",
            "new_password": self.new_password,
            "confirm_password": self.new_password,
        }

        response = self.client.post(self.change_pwd_url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_change_password_same_password_rejected(self):
        """Tests changing password to the exact same password returns HTTP 400 error."""
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": self.old_password,
            "new_password": self.old_password,
            "confirm_password": self.old_password,
        }

        response = self.client.post(self.change_pwd_url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_forgot_password_existing_email(self):
        """Tests forgot password with existing email creates AccountToken, dispatches email, and emits event."""
        mock_handler = MagicMock()
        password_reset_requested_signal.connect(mock_handler)
        mail.outbox.clear()

        response = self.client.post(
            self.forgot_pwd_url, {"email": "pwduser@example.com"}, format="json"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

        token_obj = AccountToken.objects.filter(
            user=self.user, token_type=AccountTokenType.PASSWORD_RESET
        ).first()
        assert token_obj is not None
        assert token_obj.is_active is True

        assert len(mail.outbox) == 1
        assert "Reset your PawMatch Password" in mail.outbox[0].subject

        assert mock_handler.called is True
        password_reset_requested_signal.disconnect(mock_handler)

        audit_entry = AuditLog.objects.filter(action="PASSWORD_RESET_REQUESTED").first()
        assert audit_entry is not None

    def test_forgot_password_non_existent_email_generic_response(self):
        """Tests forgot password with unknown email returns identical HTTP 200 response without leaking account existence."""
        mail.outbox.clear()

        response = self.client.post(
            self.forgot_pwd_url, {"email": "nonexistent@example.com"}, format="json"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert len(mail.outbox) == 0

    def test_reset_password_success(self):
        """Tests resetting password with valid raw token updates password, marks token used, and sends email."""
        token_obj, raw_token = PasswordService.generate_reset_token(self.user)
        mock_handler = MagicMock()
        password_reset_completed_signal.connect(mock_handler)
        mail.outbox.clear()

        payload = {
            "token": raw_token,
            "new_password": self.new_password,
            "confirm_password": self.new_password,
        }

        response = self.client.post(self.reset_pwd_url, payload, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

        self.user.refresh_from_db()
        assert self.user.check_password(self.new_password) is True

        token_obj.refresh_from_db()
        assert token_obj.is_active is False
        assert token_obj.used_at is not None

        assert len(mail.outbox) == 1
        assert "Security Alert: PawMatch Password Changed" in mail.outbox[0].subject

        assert mock_handler.called is True
        password_reset_completed_signal.disconnect(mock_handler)

        audit_entry = AuditLog.objects.filter(action="PASSWORD_RESET_COMPLETED").first()
        assert audit_entry is not None

    def test_reset_password_invalid_token(self):
        """Tests reset password with invalid raw token returns HTTP 400 error."""
        payload = {
            "token": "invalid_raw_token_string",
            "new_password": self.new_password,
            "confirm_password": self.new_password,
        }

        response = self.client.post(self.reset_pwd_url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_reset_password_expired_token(self):
        """Tests reset password with an expired token returns HTTP 400 error."""
        token_obj, raw_token = PasswordService.generate_reset_token(self.user)
        token_obj.expires_at = timezone.now() - timedelta(hours=1)
        token_obj.save()

        payload = {
            "token": raw_token,
            "new_password": self.new_password,
            "confirm_password": self.new_password,
        }

        response = self.client.post(self.reset_pwd_url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_reset_password_reused_token(self):
        """Tests that a used reset token cannot be reused a second time."""
        _, raw_token = PasswordService.generate_reset_token(self.user)
        payload = {
            "token": raw_token,
            "new_password": self.new_password,
            "confirm_password": self.new_password,
        }

        # First reset succeeds
        first_res = self.client.post(self.reset_pwd_url, payload, format="json")
        assert first_res.status_code == status.HTTP_200_OK

        # Second reset fails
        second_res = self.client.post(self.reset_pwd_url, payload, format="json")
        assert second_res.status_code == status.HTTP_400_BAD_REQUEST
