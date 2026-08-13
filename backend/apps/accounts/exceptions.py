"""
Domain-specific exceptions for PawMatch Accounts & Authentication module.
"""

from rest_framework.exceptions import APIException


class AccountsException(APIException):
    """Base domain exception for Accounts module."""

    status_code = 400
    default_detail = "An accounts domain error occurred."
    default_code = "accounts_error"


class AuthenticationException(AccountsException):
    status_code = 401
    default_detail = "Invalid email or password."
    default_code = "invalid_credentials"


class AccountDisabledException(AccountsException):
    status_code = 401
    default_detail = "Your account has been disabled."
    default_code = "account_disabled"


class RegistrationException(AccountsException):
    status_code = 400
    default_detail = "Registration failed."
    default_code = "registration_failed"


class EmailDeliveryException(AccountsException):
    status_code = 503
    default_detail = (
        "Verification email could not be delivered. Please try again later."
    )
    default_code = "email_delivery_failed"



class InvalidTokenException(AccountsException):
    status_code = 400
    default_detail = "Verification token is invalid, expired, or already used."
    default_code = "invalid_token"


class ExpiredTokenException(InvalidTokenException):
    default_detail = "Verification token has expired."
    default_code = "token_expired"


class TokenAlreadyUsedException(InvalidTokenException):
    default_detail = "Verification token has already been consumed."
    default_code = "token_already_used"


class InvalidOTPException(AccountsException):
    status_code = 400
    default_detail = "Invalid verification code."
    default_code = "invalid_otp"


class ExpiredOTPException(InvalidOTPException):
    default_detail = "Verification code has expired."
    default_code = "otp_expired"


class MaxOTPAttemptsExceededException(InvalidOTPException):
    default_detail = (
        "Maximum verification attempts exceeded. Please request a new code."
    )
    default_code = "max_otp_attempts_exceeded"


class OTPAlreadyUsedException(InvalidOTPException):
    default_detail = "Verification code has already been used."
    default_code = "otp_already_used"


class EmailAlreadyVerifiedException(AccountsException):
    status_code = 400
    default_detail = "Email address is already verified."
    default_code = "email_already_verified"


class PasswordMismatchException(AccountsException):
    status_code = 400
    default_detail = "Passwords do not match."
    default_code = "password_mismatch"


class InvalidCurrentPasswordException(AccountsException):
    status_code = 400
    default_detail = "Current password is incorrect."
    default_code = "invalid_current_password"


class PasswordReuseException(AccountsException):
    status_code = 400
    default_detail = "Cannot reuse a recently used password."
    default_code = "password_reuse"


class PasswordResetExpiredException(ExpiredTokenException):
    default_detail = "Password reset link has expired."
    default_code = "password_reset_expired"


class AuthorizationException(AccountsException):
    """Base domain exception for Authorization failures."""

    status_code = 403
    default_detail = "You do not have permission to perform this action."
    default_code = "authorization_error"


class PermissionDeniedException(AuthorizationException):
    status_code = 403
    default_detail = "Required permission was denied."
    default_code = "permission_denied"


class RoleRequiredException(AuthorizationException):
    status_code = 403
    default_detail = "Required role missing."
    default_code = "role_required"


class PolicyViolationException(AuthorizationException):
    status_code = 403
    default_detail = "Policy authorization failed."
    default_code = "policy_violation"


class InvalidRoleException(AuthorizationException):
    status_code = 400
    default_detail = "Invalid role specified."
    default_code = "invalid_role"


class DuplicateRoleException(AuthorizationException):
    status_code = 400
    default_detail = "User already possesses this role."
    default_code = "duplicate_role"


class RoleNotAssignedException(AuthorizationException):
    status_code = 400
    default_detail = "Role is not assigned to user."
    default_code = "role_not_assigned"
