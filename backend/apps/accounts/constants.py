"""
Centralized constants for the PawMatch Accounts & Authentication module.
Consolidates audit action names, throttle scopes, template paths, and standard messages.
"""


class AuditAction:
    """Security audit log action names."""

    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED_CREDENTIALS = "LOGIN_FAILED_CREDENTIALS"
    LOGIN_FAILED_DISABLED = "LOGIN_FAILED_DISABLED"
    LOGOUT_SUCCESS = "LOGOUT_SUCCESS"
    LOGOUT_FAILED = "LOGOUT_FAILED"
    TOKEN_REFRESH_SUCCESS = "TOKEN_REFRESH_SUCCESS"
    TOKEN_REFRESH_FAILED = "TOKEN_REFRESH_FAILED"
    REGISTRATION_SUCCESS = "REGISTRATION_SUCCESS"
    REGISTRATION_FAILED_DUPLICATE = "REGISTRATION_FAILED_DUPLICATE"
    EMAIL_VERIFICATION_SUCCESS = "EMAIL_VERIFICATION_SUCCESS"
    EMAIL_VERIFICATION_FAILED = "EMAIL_VERIFICATION_FAILED"
    VERIFICATION_EMAIL_RESENT = "VERIFICATION_EMAIL_RESENT"
    RESEND_VERIFICATION_FAILED = "RESEND_VERIFICATION_FAILED"
    OTP_GENERATED = "OTP_GENERATED"
    OTP_SENT = "OTP_SENT"
    OTP_VERIFICATION_SUCCESS = "OTP_VERIFICATION_SUCCESS"
    OTP_VERIFICATION_FAILED = "OTP_VERIFICATION_FAILED"
    OTP_EXPIRED = "OTP_EXPIRED"
    OTP_MAX_ATTEMPTS_EXCEEDED = "OTP_MAX_ATTEMPTS_EXCEEDED"
    OTP_RESENT = "OTP_RESENT"
    PROFILE_UPDATED = "PROFILE_UPDATED"
    AVATAR_UPLOADED = "AVATAR_UPLOADED"
    AVATAR_DELETED = "AVATAR_DELETED"
    ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED"
    PASSWORD_CHANGED = "PASSWORD_CHANGED"
    PASSWORD_CHANGE_FAILED = "PASSWORD_CHANGE_FAILED"
    PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED"
    PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED"
    PASSWORD_RESET_FAILED = "PASSWORD_RESET_FAILED"
    AUTHORIZATION_GRANTED = "AUTHORIZATION_GRANTED"
    AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED"
    ROLE_ASSIGNED = "ROLE_ASSIGNED"
    ROLE_REMOVED = "ROLE_REMOVED"
    ROLE_REPLACED = "ROLE_REPLACED"
    RBAC_SYNC_STARTED = "RBAC_SYNC_STARTED"
    RBAC_SYNC_COMPLETED = "RBAC_SYNC_COMPLETED"
    RBAC_SYNC_FAILED = "RBAC_SYNC_FAILED"


class ThrottleScope:
    """DRF Rate limiting throttle scopes."""

    LOGIN_ANON = "login_anon"
    LOGIN_USER = "login_user"
    REGISTER_ANON = "register_anon"
    RESEND_VERIFICATION = "resend_verification"
    VERIFY_EMAIL_OTP = "verify_email_otp"
    PASSWORD_RESET = "password_reset"


class EmailTemplate:
    """Transactional email template paths."""

    VERIFICATION_EMAIL = "emails/verification_email.html"
    WELCOME_EMAIL = "emails/welcome_email.html"
    PASSWORD_RESET_EMAIL = "emails/password_reset_email.html"
    PASSWORD_CHANGED_EMAIL = "emails/password_changed_email.html"


class AuthMessage:
    """User-facing API response message text."""

    LOGIN_SUCCESS = "Login successful."
    LOGOUT_SUCCESS = "Successfully logged out."
    TOKEN_REFRESH_SUCCESS = "Token refreshed successfully."
    CURRENT_USER_RETRIEVED = "Current user profile retrieved successfully."
    REGISTRATION_SUCCESS = (
        "Registration successful. Please check your email for your 6-digit "
        "verification code."
    )
    EMAIL_VERIFIED_SUCCESS = "Email verified successfully. Your account is now active."
    VERIFICATION_RESENT_SUCCESS = "Verification code sent. Please check your inbox."
    PROFILE_RETRIEVED_SUCCESS = "User profile retrieved successfully."
    PROFILE_UPDATED_SUCCESS = "User profile updated successfully."
    AVATAR_UPLOADED_SUCCESS = "Avatar uploaded successfully."
    AVATAR_DELETED_SUCCESS = "Avatar deleted successfully."
    ACCOUNT_DEACTIVATED_SUCCESS = "Account deactivated successfully."
    PASSWORD_CHANGED_SUCCESS = "Password changed successfully."
    FORGOT_PASSWORD_SUCCESS = (
        "If an account with that email exists, a password reset link has been " "sent."
    )
    PASSWORD_RESET_SUCCESS = (
        "Password reset successfully. You can now log in with your new password."
    )
    PERMISSION_DENIED = "You do not have permission to perform this action."

    INVALID_CREDENTIALS = "Invalid email or password."
    ACCOUNT_DISABLED = "Your account has been disabled."
    TOKEN_INVALID_OR_EXPIRED = "Token is invalid, expired, or already used."
    INVALID_OTP = "Invalid verification code. Please check and try again."
    EXPIRED_OTP = "Verification code has expired. Please request a new code."
    MAX_OTP_ATTEMPTS = (
        "Maximum verification attempts exceeded. Please request a new code."
    )
    REFRESH_TOKEN_REQUIRED = "Refresh token is required."
    EMAIL_ALREADY_EXISTS = "A user with that email already exists."
    EMAIL_ALREADY_VERIFIED = "Email address is already verified."
    USER_NOT_FOUND = "User with this email address does not exist."
    PASSWORD_MISMATCH = "Passwords do not match."
    INCORRECT_PASSWORD = "Current password is incorrect."
    SAME_PASSWORD_ERROR = "New password cannot be identical to current password."
    PASSWORD_REUSE_ERROR = "Cannot reuse a recently used password."


DEFAULT_USER_PREFERENCES = {
    "email_notifications": True,
    "marketing_emails": False,
    "theme": "system",
    "language": "en",
}
