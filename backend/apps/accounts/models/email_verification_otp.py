"""
EmailVerificationOTP model definition for PawMatch.
Provides cryptographically secure 6-digit OTP verification infrastructure for email verification.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.accounts.utils import hash_token
from apps.core.mixins import TimestampedModel, UUIDModel


class EmailVerificationOTP(UUIDModel, TimestampedModel):
    """
    Cryptographically secure single-use 6-digit email verification OTP model.
    Stores SHA-256 hashes of raw 6-digit OTP strings to protect against database leaks.
    """

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="email_verification_otps",
    )
    otp_hash = models.CharField(
        _("otp hash"),
        max_length=128,
        db_index=True,
    )
    expires_at = models.DateTimeField(
        _("expires at"),
        db_index=True,
    )
    attempts = models.PositiveIntegerField(
        _("attempts"),
        default=0,
    )
    max_attempts = models.PositiveIntegerField(
        _("max attempts"),
        default=5,
    )
    used_at = models.DateTimeField(
        _("used at"),
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(
        _("is active"),
        default=True,
        db_index=True,
    )

    class Meta:
        verbose_name = _("email verification OTP")
        verbose_name_plural = _("email verification OTPs")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["otp_hash"]),
            models.Index(fields=["user", "is_active"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self) -> str:
        return f"OTP for {self.user.email} (Active: {self.is_active}, Attempts: {self.attempts})"

    @classmethod
    def hash_otp(cls, raw_otp: str) -> str:
        """Computes a SHA-256 hash of the raw 6-digit OTP string."""
        return hash_token(raw_otp)

    def is_valid(self) -> bool:
        """Returns True if the OTP is active, unused, unexpired, and under attempt limits."""
        return (
            self.is_active
            and self.used_at is None
            and self.attempts < self.max_attempts
            and timezone.now() < self.expires_at
        )

    def is_expired(self) -> bool:
        """Returns True if current time is past expiration timestamp."""
        return timezone.now() >= self.expires_at

    def has_exceeded_attempts(self) -> bool:
        """Returns True if max attempt limit has been reached or exceeded."""
        return self.attempts >= self.max_attempts

    def increment_attempts(self) -> int:
        """Increments attempt count and deactivates OTP if max attempts reached."""
        self.attempts += 1
        if self.attempts >= self.max_attempts:
            self.is_active = False
        self.save(update_fields=["attempts", "is_active", "updated_at"])
        return self.attempts

    def mark_as_used(self) -> None:
        """Marks OTP as consumed and inactive."""
        self.used_at = timezone.now()
        self.is_active = False
        self.save(update_fields=["used_at", "is_active", "updated_at"])
