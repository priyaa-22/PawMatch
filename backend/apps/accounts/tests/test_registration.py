"""
Comprehensive unit and integration test suite for PawMatch User Registration,
EmailVerificationOTP Lifecycle, Events, Validators, and Resend OTP APIs.
"""

from datetime import timedelta
from unittest.mock import MagicMock

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from apps.accounts.config import accounts_config
from apps.accounts.events import user_registered_signal
from apps.accounts.models import AccountToken, AccountTokenType, EmailVerificationOTP
from apps.accounts.services.registration_service import RegistrationService
from apps.accounts.validators import validate_phone_number
from apps.audit_logs.models import AuditLog

User = get_user_model()


class TestRegistrationAndOTPVerification(APITestCase):
    """
    Test suite for User Registration, 6-digit Email Verification OTP,
    and OTP Lifecycle management.
    """

    def setUp(self):
        try:
            cache.clear()
        except Exception:
            pass

        self.register_url = reverse("accounts:register")
        self.verify_url = reverse("accounts:verify_email_otp")
        self.resend_url = reverse("accounts:resend_verification_otp")

        self.valid_payload = {
            "email": "newuser@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "New",
            "last_name": "User",
        }

    def tearDown(self):
        try:
            cache.clear()
        except Exception:
            pass

    def test_successful_user_registration(self):
        """
        Tests registering a new user creates inactive account,
        OTP hash, email outbox message, and audit log.
        """
        response = self.client.post(
            self.register_url, self.valid_payload, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert "user" in response.data["data"]

        user = User.objects.get(email="newuser@example.com")
        assert user.is_active is False
        assert user.is_email_verified is False

        # Verify EmailVerificationOTP created with otp_hash
        otp_obj = EmailVerificationOTP.objects.filter(user=user, is_active=True).first()
        assert otp_obj is not None
        assert otp_obj.is_active is True
        assert otp_obj.otp_hash != ""

        # Verify email outbox contains 1 verification OTP email
        assert len(mail.outbox) == 1
        assert "Your PawMatch Verification Code" in mail.outbox[0].subject
        assert "newuser@example.com" in mail.outbox[0].to

        # Verify audit log recorded
        audit_entry = AuditLog.objects.filter(action="REGISTRATION_SUCCESS").first()
        assert audit_entry is not None
        assert audit_entry.email == "newuser@example.com"

    def test_register_duplicate_email(self):
        """Tests registering with existing email returns HTTP 400 error."""
        User.objects.create_user(
            email="newuser@example.com",
            first_name="Existing",
            last_name="User",
            password="Password123!",
        )

        response = self.client.post(
            self.register_url, self.valid_payload, format="json"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False
        assert "email" in response.data["errors"]

    def test_register_password_mismatch(self):
        """Tests registration fails when passwords do not match."""
        payload = self.valid_payload.copy()
        payload["confirm_password"] = "DifferentPassword123!"

        response = self.client.post(self.register_url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False
        assert "confirm_password" in response.data["errors"]

    def test_register_weak_password(self):
        """Tests registration fails when password is weak."""
        payload = self.valid_payload.copy()
        payload["password"] = "123"
        payload["confirm_password"] = "123"

        response = self.client.post(self.register_url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_email_verification_otp_successful(self):
        """
        Tests verifying account with valid 6-digit OTP activates user
        and dispatches welcome email.
        """
        user, _, raw_otp = RegistrationService.register_user(
            email="verify@example.com",
            password="Password123!",
            first_name="Verify",
            last_name="User",
        )
        mail.outbox.clear()

        verify_res = self.client.post(
            self.verify_url,
            {"email": "verify@example.com", "otp": raw_otp},
            format="json",
        )

        assert verify_res.status_code == status.HTTP_200_OK
        assert verify_res.data["success"] is True

        user.refresh_from_db()
        assert user.is_active is True
        assert user.is_email_verified is True

        # Verify welcome email sent
        assert len(mail.outbox) == 1
        assert "Welcome to PawMatch!" in mail.outbox[0].subject

        # Verify audit trail
        audit_entry = AuditLog.objects.filter(action="OTP_VERIFICATION_SUCCESS").first()
        assert audit_entry is not None

    def test_email_verification_invalid_otp(self):
        """Tests verifying with invalid 6-digit OTP returns HTTP 400 error."""
        user, _, _ = RegistrationService.register_user(
            email="invalid_otp@example.com",
            password="Password123!",
            first_name="Invalid",
            last_name="OTP",
        )

        verify_res = self.client.post(
            self.verify_url,
            {"email": "invalid_otp@example.com", "otp": "999999"},
            format="json",
        )

        assert verify_res.status_code == status.HTTP_400_BAD_REQUEST
        assert verify_res.data["success"] is False

    def test_email_verification_expired_otp(self):
        """Tests verifying with an expired OTP returns HTTP 400 error."""
        user, otp_obj, raw_otp = RegistrationService.register_user(
            email="expired@example.com",
            password="Password123!",
            first_name="Expired",
            last_name="User",
        )

        # Manually expire OTP
        otp_obj.expires_at = timezone.now() - timedelta(minutes=15)
        otp_obj.save()

        verify_res = self.client.post(
            self.verify_url,
            {"email": "expired@example.com", "otp": raw_otp},
            format="json",
        )

        assert verify_res.status_code == status.HTTP_400_BAD_REQUEST
        assert verify_res.data["success"] is False

    def test_email_verification_max_attempts_exceeded(self):
        """
        Tests that exceeding max OTP attempt limit deactivates OTP
        and rejects further requests.
        """
        user, otp_obj, raw_otp = RegistrationService.register_user(
            email="max_attempts@example.com",
            password="Password123!",
            first_name="Max",
            last_name="Attempts",
        )

        # Fail 5 consecutive times
        for _ in range(5):
            self.client.post(
                self.verify_url,
                {"email": "max_attempts@example.com", "otp": "000000"},
                format="json",
            )

        otp_obj.refresh_from_db()
        assert otp_obj.is_active is False

        # Clear throttle cache so 6th request tests application-level 400 rejection
        cache.clear()

        # Attempt with correct OTP now fails because max attempts was reached
        res = self.client.post(
            self.verify_url,
            {"email": "max_attempts@example.com", "otp": raw_otp},
            format="json",
        )
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_email_verification_reused_otp(self):
        """Tests used OTP cannot be reused for second verification attempt."""
        user, _, raw_otp = RegistrationService.register_user(
            email="reused@example.com",
            password="Password123!",
            first_name="Reused",
            last_name="User",
        )

        # First verification succeeds
        first_res = self.client.post(
            self.verify_url,
            {"email": "reused@example.com", "otp": raw_otp},
            format="json",
        )
        assert first_res.status_code == status.HTTP_200_OK

        # Second verification fails (user is already verified)
        second_res = self.client.post(
            self.verify_url,
            {"email": "reused@example.com", "otp": raw_otp},
            format="json",
        )
        assert second_res.status_code == status.HTTP_400_BAD_REQUEST

    def test_resend_verification_otp_successful(self):
        """
        Tests resending verification OTP invalidates previous OTPs
        and dispatches new email.
        """
        user, old_otp_obj, _ = RegistrationService.register_user(
            email="resend@example.com",
            password="Password123!",
            first_name="Resend",
            last_name="User",
        )
        mail.outbox.clear()

        resend_res = self.client.post(
            self.resend_url, {"email": "resend@example.com"}, format="json"
        )

        assert resend_res.status_code == status.HTTP_200_OK
        assert resend_res.data["success"] is True

        old_otp_obj.refresh_from_db()
        assert old_otp_obj.is_active is False

        new_otp_obj = EmailVerificationOTP.objects.filter(
            user=user,
            is_active=True,
        ).first()
        assert new_otp_obj is not None

        assert len(mail.outbox) == 1
        assert "Your PawMatch Verification Code" in mail.outbox[0].subject

    def test_resend_verification_already_verified_user(self):
        """Tests resending verification for verified user returns HTTP 400."""
        User.objects.create_user(
            email="verified@example.com",
            first_name="Verified",
            last_name="User",
            password="Password123!",
            is_active=True,
            is_email_verified=True,
        )

        resend_res = self.client.post(
            self.resend_url, {"email": "verified@example.com"}, format="json"
        )

        assert resend_res.status_code == status.HTTP_400_BAD_REQUEST
        assert resend_res.data["success"] is False

    def test_resend_verification_unknown_email(self):
        """
        Tests resending verification for non-existent email returns HTTP 400.
        """
        resend_res = self.client.post(
            self.resend_url, {"email": "nonexistent@example.com"}, format="json"
        )

        assert resend_res.status_code == status.HTTP_400_BAD_REQUEST
        assert resend_res.data["success"] is False

    def test_account_token_generic_types_and_metadata(self):
        """
        Tests generic AccountToken supports PASSWORD_RESET token type
        and JSON metadata.
        """
        user = User.objects.create_user(
            email="token_test@example.com",
            first_name="Token",
            last_name="Test",
            password="Password123!",
        )

        token = AccountToken.objects.create(
            user=user,
            token_hash="hash123",
            token_type=AccountTokenType.PASSWORD_RESET,
            expires_at=timezone.now() + timedelta(hours=1),
            metadata={"device": "mobile_app"},
        )

        assert token.token_type == AccountTokenType.PASSWORD_RESET
        assert token.metadata["device"] == "mobile_app"
        assert str(token).startswith("[PASSWORD_RESET]")

    def test_phone_number_validator(self):
        """Tests phone number validator formats."""
        assert validate_phone_number("+1234567890") == "+1234567890"
        assert validate_phone_number("123-456-7890") == "1234567890"
        assert validate_phone_number("") == ""

        try:
            validate_phone_number("invalid_phone")
            assert False, "Should have raised ValidationError"
        except ValidationError:
            pass

    def test_event_dispatcher_signal(self):
        """Tests event signal dispatching for user registration."""
        mock_handler = MagicMock()
        user_registered_signal.connect(mock_handler)

        self.client.post(self.register_url, self.valid_payload, format="json")

        assert mock_handler.called is True
        user_registered_signal.disconnect(mock_handler)

    def test_accounts_config_defaults(self):
        """Tests accounts_config property accessors."""
        assert accounts_config.email_verification_otp_expiry_minutes == 10
        assert accounts_config.max_otp_attempts == 5
        assert "http" in accounts_config.frontend_url
        assert accounts_config.email_provider_backend == "SMTP"
