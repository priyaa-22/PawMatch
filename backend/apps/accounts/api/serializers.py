"""
REST API serializers for PawMatch Authentication, User Registration, Email Verification,
User Profile Management & Password Management.
"""

from rest_framework import serializers

from apps.accounts.models import User, UserProfile
from apps.accounts.validators import (
    validate_email_unique,
    validate_password_confirmation,
)


class LoginSerializer(serializers.Serializer):
    """Serializer for user authentication requests."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )


class LogoutSerializer(serializers.Serializer):
    """Serializer for refresh token blacklisting on logout."""

    refresh = serializers.CharField(required=True)


class CurrentUserSerializer(serializers.ModelSerializer):
    """Serializer for returning current user profile details."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "profile_image",
            "is_email_verified",
        )
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration requests."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
    confirm_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        # Validate password confirmation & strength rules
        validate_password_confirmation(password, confirm_password)

        # Validate email uniqueness & normalization
        normalized_email = validate_email_unique(attrs.get("email", ""))

        attrs["email"] = normalized_email
        return attrs


class VerifyEmailOTPSerializer(serializers.Serializer):
    """Serializer for 6-digit email verification OTP requests."""

    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)

    def validate_otp(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned.isdigit() or len(cleaned) != 6:
            raise serializers.ValidationError(
                "Verification code must be exactly 6 numeric digits."
            )
        return cleaned


class ResendVerificationOTPSerializer(serializers.Serializer):
    """Serializer for resending 6-digit email verification OTP requests."""

    email = serializers.EmailField(required=True)


class UserProfileResponseSerializer(serializers.Serializer):
    """Serializer for returning comprehensive user profile information."""

    id = serializers.UUIDField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    phone_number = serializers.CharField(read_only=True)
    bio = serializers.CharField(read_only=True)
    avatar = serializers.SerializerMethodField()
    date_of_birth = serializers.DateField(read_only=True)
    preferences = serializers.JSONField(read_only=True)
    is_email_verified = serializers.BooleanField(
        source="user.is_email_verified", read_only=True
    )
    date_joined = serializers.DateTimeField(source="user.created_at", read_only=True)
    last_login = serializers.DateTimeField(source="user.last_login", read_only=True)

    def get_avatar(self, obj: UserProfile) -> str:
        if obj.avatar:
            request = self.context.get("request")
            if request and hasattr(obj.avatar, "url"):
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url if hasattr(obj.avatar, "url") else str(obj.avatar)
        return ""


class UpdateProfileSerializer(serializers.Serializer):
    """Serializer for partial updating user personal info & profile details."""

    first_name = serializers.CharField(required=False, max_length=150)
    last_name = serializers.CharField(required=False, max_length=150)
    phone_number = serializers.CharField(
        required=False, allow_blank=True, max_length=30
    )
    bio = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    preferences = serializers.JSONField(required=False)

    ALLOWED_FIELDS = {
        "first_name",
        "last_name",
        "phone_number",
        "bio",
        "date_of_birth",
        "preferences",
    }

    def validate(self, attrs):
        submitted_fields = set(self.initial_data.keys())
        invalid_fields = submitted_fields - self.ALLOWED_FIELDS
        if invalid_fields:
            errors = {
                field: [f"Field '{field}' is unknown or cannot be modified."]
                for field in invalid_fields
            }
            raise serializers.ValidationError(errors)
        return attrs


class UploadAvatarSerializer(serializers.Serializer):
    """Serializer for uploading avatar image."""

    avatar = serializers.ImageField(required=True)


class DeactivateAccountSerializer(serializers.Serializer):
    """Serializer for account deactivation password confirmation."""

    password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for authenticated password change requests."""

    current_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
    confirm_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password reset email requests."""

    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for token-based password reset requests."""

    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
    confirm_password = serializers.CharField(
        required=True, write_only=True, style={"input_type": "password"}
    )
