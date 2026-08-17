"""
Comprehensive unit and integration test suite for PawMatch User Registration,
EmailVerificationOTP Lifecycle, Events, Validators, Brevo API Provider, and Resend OTP APIs.
"""

import io
import json
import urllib.error
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.conf import settings
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
from apps.accounts.services.email_service import BrevoAPIProvider, EmailService
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

        self.orig_provider = getattr(settings, "ACCOUNTS_EMAIL_PROVIDER", "BREVO_API")
        settings.ACCOUNTS_EMAIL_PROVIDER = "SMTP"

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
        settings.ACCOUNTS_EMAIL_PROVIDER = self.orig_provider

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


class TestBrevoAPIProvider(APITestCase):
    """
    Test suite for Brevo Transactional Email HTTPS API Provider.
    Verifies URL target, request headers, payload structure, error handling, and API key safety.
    """

    def setUp(self):
        self.orig_key = getattr(settings, "BREVO_API_KEY", "")
        self.orig_provider = getattr(settings, "ACCOUNTS_EMAIL_PROVIDER", "BREVO_API")
        settings.BREVO_API_KEY = "xkeysib-secret-test-key-12345"
        settings.ACCOUNTS_EMAIL_PROVIDER = "BREVO_API"

    def tearDown(self):
        settings.BREVO_API_KEY = self.orig_key
        settings.ACCOUNTS_EMAIL_PROVIDER = self.orig_provider

    @patch("urllib.request.urlopen")
    def test_brevo_api_provider_success(self, mock_urlopen):
        """
        Tests valid BREVO_API_KEY results in correct Brevo HTTPS API request,
        with expected headers, payload parameters, and successful response.
        """
        mock_response = MagicMock()
        mock_response.status = 201
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        provider = BrevoAPIProvider()
        result = provider.send_email(
            to_email="recipient@example.com",
            subject="Test Subject",
            html_content="<p>Test HTML</p>",
            text_content="Test Text",
        )

        assert result is True
        assert mock_urlopen.called is True

        # Inspect request object passed to urlopen
        req = mock_urlopen.call_args[0][0]
        assert req.full_url == "https://api.brevo.com/v3/smtp/email"
        assert req.headers.get("Api-key") == "xkeysib-secret-test-key-12345"
        assert req.headers.get("Content-type") == "application/json"

        body_payload = json.loads(req.data.decode("utf-8"))
        assert body_payload["to"] == [{"email": "recipient@example.com"}]
        assert body_payload["subject"] == "Test Subject"
        assert body_payload["htmlContent"] == "<p>Test HTML</p>"
        assert body_payload["textContent"] == "Test Text"
        assert "email" in body_payload["sender"]

    def test_brevo_api_provider_missing_key_raises_error(self):
        """Tests calling Brevo API provider without BREVO_API_KEY raises ValueError."""
        settings.BREVO_API_KEY = ""
        provider = BrevoAPIProvider()

        try:
            provider.send_email(
                to_email="recipient@example.com",
                subject="Test",
                html_content="<p>Test</p>",
                text_content="Test",
            )
            assert False, "Should have raised ValueError"
        except ValueError as exc:
            assert "BREVO_API_KEY environment variable is missing" in str(exc)

    @patch("urllib.request.urlopen")
    def test_brevo_api_provider_http_error_handling(self, mock_urlopen):
        """Tests Brevo HTTPError (e.g. 401 Unauthorized) is caught and handled cleanly."""
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://api.brevo.com/v3/smtp/email",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=io.BytesIO(b'{"message": "Invalid API key"}'),
        )

        provider = BrevoAPIProvider()
        try:
            provider.send_email(
                to_email="recipient@example.com",
                subject="Test",
                html_content="<p>Test</p>",
                text_content="Test",
            )
            assert False, "Should have raised RuntimeError"
        except RuntimeError as exc:
            assert "401" in str(exc)
            # Ensure secret API key is NOT exposed in exception message
            assert "xkeysib-secret-test-key-12345" not in str(exc)

    @patch("urllib.request.urlopen")
    def test_brevo_api_provider_network_error_handling(self, mock_urlopen):
        """Tests Brevo URLError (network connection failure) is caught and handled cleanly."""
        mock_urlopen.side_effect = urllib.error.URLError(reason="Connection timeout")

        provider = BrevoAPIProvider()
        try:
            provider.send_email(
                to_email="recipient@example.com",
                subject="Test",
                html_content="<p>Test</p>",
                text_content="Test",
            )
            assert False, "Should have raised RuntimeError"
        except RuntimeError as exc:
            assert "Connection timeout" in str(exc)

    @patch.object(BrevoAPIProvider, "send_email", return_value=True)
    def test_email_service_dispatches_via_brevo_api(self, mock_send_email):
        """Tests EmailService delegates verification email dispatch to BrevoAPIProvider."""
        user = User.objects.create_user(
            email="brevo_user@example.com",
            first_name="Brevo",
            last_name="User",
            password="Password123!",
        )

        success = EmailService.send_verification_otp_email(user=user, raw_otp="123456")
        assert success is True
        assert mock_send_email.called is True

    def test_brevo_test_connection_missing_key(self):
        """Tests test_connection() reports missing_api_key when key is empty."""
        settings.BREVO_API_KEY = ""
        provider = BrevoAPIProvider()
        result = provider.test_connection()
        assert result["success"] is False
        assert result["status_code"] == 400
        assert result["reason"] == "missing_api_key"

    @patch("urllib.request.urlopen")
    def test_brevo_test_connection_invalid_key_401(self, mock_urlopen):
        """Tests test_connection() reports invalid_api_key on HTTP 401 response."""
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="https://api.brevo.com/v3/account",
            code=401,
            msg="Unauthorized",
            hdrs={},
            fp=io.BytesIO(b'{"message": "Key not found", "code": "unauthorized"}'),
        )
        provider = BrevoAPIProvider()
        result = provider.test_connection()
        assert result["success"] is False
        assert result["status_code"] == 401
        assert result["reason"] == "invalid_api_key"
        assert "xkeysib-secret-test-key-12345" not in str(result)

    @patch("urllib.request.urlopen")
    def test_brevo_test_connection_network_failure(self, mock_urlopen):
        """Tests test_connection() reports network_failure on URLError."""
        mock_urlopen.side_effect = urllib.error.URLError(reason="Connection refused")
        provider = BrevoAPIProvider()
        result = provider.test_connection()
        assert result["success"] is False
        assert result["status_code"] == 503
        assert result["reason"] == "network_failure"

    @patch("urllib.request.urlopen")
    def test_brevo_test_connection_valid_credentials_200(self, mock_urlopen):
        """Tests test_connection() reports valid_credentials on HTTP 200 response."""
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__.return_value = mock_response
        mock_urlopen.return_value = mock_response

        provider = BrevoAPIProvider()
        result = provider.test_connection()
        assert result["success"] is True
        assert result["status_code"] == 200
        assert result["reason"] == "valid_credentials"

    @patch.object(EmailService, "send_verification_otp_email", return_value=False)
    def test_registration_fails_when_email_delivery_fails(self, mock_send_email):
        """
        Tests registration fails with HTTP 503 and rolls back user DB creation
        when verification email cannot be sent.
        """
        settings.ACCOUNTS_EMAIL_PROVIDER = "BREVO_API"
        payload = {
            "email": "failed_email_user@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "Failed",
            "last_name": "Email",
        }
        response = self.client.post(
            reverse("accounts:register"), payload, format="json"
        )

        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert response.data["success"] is False
        assert "verification email" in response.data["message"].lower()

        # Assert User creation was rolled back (no orphan user in DB)
        assert not User.objects.filter(email="failed_email_user@example.com").exists()


class TestFixedOTPMode(APITestCase):
    """
    Test suite for temporary FIXED OTP mode (EMAIL_VERIFICATION_MODE=FIXED).
    Verifies fixed 6767 OTP generation, registration without external email calls,
    successful account verification, invalid/expired/reused OTP behavior, and privacy.
    """

    def setUp(self):
        try:
            cache.clear()
        except Exception:
            pass
        self.orig_mode = getattr(settings, "EMAIL_VERIFICATION_MODE", "BREVO_API")
        self.orig_fixed_otp = getattr(settings, "EMAIL_VERIFICATION_FIXED_OTP", "6767")
        self.orig_provider = getattr(settings, "ACCOUNTS_EMAIL_PROVIDER", "BREVO_API")
        settings.EMAIL_VERIFICATION_MODE = "FIXED"
        settings.EMAIL_VERIFICATION_FIXED_OTP = "6767"

    def tearDown(self):
        try:
            cache.clear()
        except Exception:
            pass
        settings.EMAIL_VERIFICATION_MODE = self.orig_mode
        settings.EMAIL_VERIFICATION_FIXED_OTP = self.orig_fixed_otp
        settings.ACCOUNTS_EMAIL_PROVIDER = self.orig_provider

    @patch.object(BrevoAPIProvider, "send_email")
    def test_fixed_mode_registration_succeeds_without_brevo_call(self, mock_brevo_send):
        """Tests registration in FIXED mode succeeds without making external Brevo API calls."""
        payload = {
            "email": "fixed_user@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "Fixed",
            "last_name": "User",
        }
        response = self.client.post(
            reverse("accounts:register"), payload, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert mock_brevo_send.called is False

        # Verify OTP is NOT returned in API response
        response_str = json.dumps(response.data)
        assert "6767" not in response_str
        assert "otp" not in response.data["data"]

        # Assert user created in inactive state
        user = User.objects.get(email="fixed_user@example.com")
        assert user.is_active is False
        assert user.is_email_verified is False

    @patch.object(BrevoAPIProvider, "send_email")
    def test_fixed_mode_verification_success_with_6767(self, mock_brevo_send):
        """Tests verifying account with fixed OTP 6767 activates user account."""
        reg_payload = {
            "email": "verify_fixed@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "Fixed",
            "last_name": "Verify",
        }
        self.client.post(reverse("accounts:register"), reg_payload, format="json")

        verify_payload = {
            "email": "verify_fixed@example.com",
            "otp": "6767",
        }
        verify_resp = self.client.post(
            reverse("accounts:verify_email_otp"), verify_payload, format="json"
        )

        assert verify_resp.status_code == status.HTTP_200_OK
        assert verify_resp.data["success"] is True

        user = User.objects.get(email="verify_fixed@example.com")
        assert user.is_active is True
        assert user.is_email_verified is True

    def test_fixed_mode_verification_wrong_otp_fails(self):
        """Tests entering wrong OTP in FIXED mode fails."""
        reg_payload = {
            "email": "wrong_otp@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "Wrong",
            "last_name": "OTP",
        }
        self.client.post(reverse("accounts:register"), reg_payload, format="json")

        verify_payload = {
            "email": "wrong_otp@example.com",
            "otp": "9999",
        }
        verify_resp = self.client.post(
            reverse("accounts:verify_email_otp"), verify_payload, format="json"
        )

        assert verify_resp.status_code == status.HTTP_400_BAD_REQUEST
        user = User.objects.get(email="wrong_otp@example.com")
        assert user.is_active is False
        assert user.is_email_verified is False

    def test_fixed_mode_verification_expired_otp_fails(self):
        """Tests expired fixed OTP submission fails."""
        reg_payload = {
            "email": "expired_fixed@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "Expired",
            "last_name": "Fixed",
        }
        self.client.post(reverse("accounts:register"), reg_payload, format="json")

        # Expire the OTP record
        user = User.objects.get(email="expired_fixed@example.com")
        otp_obj = EmailVerificationOTP.objects.filter(user=user, is_active=True).first()
        otp_obj.expires_at = timezone.now() - timedelta(minutes=1)
        otp_obj.save()

        verify_payload = {
            "email": "expired_fixed@example.com",
            "otp": "6767",
        }
        verify_resp = self.client.post(
            reverse("accounts:verify_email_otp"), verify_payload, format="json"
        )

        assert verify_resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_fixed_mode_otp_cannot_be_reused(self):
        """Tests fixed OTP 6767 cannot be reused after successful verification."""
        reg_payload = {
            "email": "reuse_fixed@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "Reuse",
            "last_name": "Fixed",
        }
        self.client.post(reverse("accounts:register"), reg_payload, format="json")

        verify_payload = {
            "email": "reuse_fixed@example.com",
            "otp": "6767",
        }
        # First verification succeeds
        resp1 = self.client.post(
            reverse("accounts:verify_email_otp"), verify_payload, format="json"
        )
        assert resp1.status_code == status.HTTP_200_OK

        # Second verification with same OTP fails
        resp2 = self.client.post(
            reverse("accounts:verify_email_otp"), verify_payload, format="json"
        )
        assert resp2.status_code == status.HTTP_400_BAD_REQUEST

    @patch.object(BrevoAPIProvider, "send_email", return_value=True)
    def test_brevo_api_mode_still_uses_external_provider(self, mock_brevo_send):
        """Tests setting EMAIL_VERIFICATION_MODE=BREVO_API restores Brevo API email dispatch path."""
        settings.EMAIL_VERIFICATION_MODE = "BREVO_API"
        settings.ACCOUNTS_EMAIL_PROVIDER = "BREVO_API"

        reg_payload = {
            "email": "brevo_mode_user@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "first_name": "BrevoMode",
            "last_name": "User",
        }
        response = self.client.post(
            reverse("accounts:register"), reg_payload, format="json"
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert mock_brevo_send.called is True
