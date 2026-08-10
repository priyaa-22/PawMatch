"""
Centralized configuration module for PawMatch Accounts.
Reads from Django settings while providing safe defaults.
"""

from typing import List

from django.conf import settings


class AccountsConfig:
    """Centralized accounts settings accessor."""

    @property
    def email_verification_otp_expiry_minutes(self) -> int:
        return getattr(settings, "EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES", 10)

    @property
    def max_otp_attempts(self) -> int:
        return getattr(settings, "MAX_OTP_ATTEMPTS", 5)

    @property
    def password_reset_expiry_hours(self) -> int:
        return getattr(settings, "PASSWORD_RESET_TOKEN_EXPIRY_HOURS", 1)

    @property
    def frontend_url(self) -> str:
        return getattr(settings, "FRONTEND_URL", "http://localhost:5173")

    @property
    def frontend_reset_password_url(self) -> str:
        return getattr(
            settings,
            "FRONTEND_RESET_PASSWORD_URL",
            f"{self.frontend_url}/reset-password",
        )

    @property
    def force_logout_on_password_change(self) -> bool:
        return getattr(settings, "FORCE_LOGOUT_ON_PASSWORD_CHANGE", True)

    @property
    def default_token_bytes(self) -> int:
        return getattr(settings, "ACCOUNTS_DEFAULT_TOKEN_BYTES", 32)

    @property
    def email_provider_backend(self) -> str:
        return getattr(settings, "ACCOUNTS_EMAIL_PROVIDER", "SMTP").upper()

    @property
    def max_avatar_size_bytes(self) -> int:
        return getattr(settings, "MAX_AVATAR_SIZE_BYTES", 5 * 1024 * 1024)  # 5 MB

    @property
    def allowed_avatar_types(self) -> List[str]:
        return getattr(
            settings,
            "ALLOWED_AVATAR_TYPES",
            ["image/jpeg", "image/jpg", "image/png", "image/webp"],
        )

    @property
    def allowed_avatar_extensions(self) -> List[str]:
        return getattr(
            settings,
            "ALLOWED_AVATAR_EXTENSIONS",
            [".jpg", ".jpeg", ".png", ".webp"],
        )

    @property
    def default_avatar_path(self) -> str:
        return getattr(
            settings, "DEFAULT_AVATAR_PATH", "users/avatars/default_avatar.png"
        )

    @property
    def default_language(self) -> str:
        return getattr(settings, "DEFAULT_LANGUAGE", "en")

    @property
    def default_theme(self) -> str:
        return getattr(settings, "DEFAULT_THEME", "system")

    @property
    def default_role(self) -> str:
        return getattr(settings, "DEFAULT_ROLE", "ADOPTER")

    @property
    def super_admin_role(self) -> str:
        return getattr(settings, "SUPER_ADMIN_ROLE", "ADMINISTRATOR")

    @property
    def enable_object_permissions(self) -> bool:
        return getattr(settings, "ENABLE_OBJECT_PERMISSIONS", True)

    @property
    def enable_policy_engine(self) -> bool:
        return getattr(settings, "ENABLE_POLICY_ENGINE", True)

    @property
    def enable_auto_rbac_sync(self) -> bool:
        return getattr(settings, "ENABLE_AUTO_RBAC_SYNC", False)


accounts_config = AccountsConfig()
