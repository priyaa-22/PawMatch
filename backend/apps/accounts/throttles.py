"""
DRF Throttling classes for Authentication, Registration & Password Management API endpoints.
Provides rate-limiting protection against brute-force attacks and abuse.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginAnonRateThrottle(AnonRateThrottle):
    """
    Rate limiter for unauthenticated login attempts.
    Scope: 'login_anon' (Default: 5/min)
    """

    scope = "login_anon"


class LoginUserRateThrottle(UserRateThrottle):
    """
    Rate limiter for authenticated authentication attempts.
    Scope: 'login_user' (Default: 20/min)
    """

    scope = "login_user"


class RegisterRateThrottle(AnonRateThrottle):
    """
    Rate limiter for user registration attempts.
    Scope: 'register_anon' (Default: 5/min)
    """

    scope = "register_anon"


class ResendVerificationRateThrottle(AnonRateThrottle):
    """
    Rate limiter for resending email verification requests.
    Scope: 'resend_verification' (Default: 3/min)
    """

    scope = "resend_verification"


class VerifyEmailOTPRateThrottle(AnonRateThrottle):
    """
    Rate limiter for email verification OTP attempts to protect against brute-force attacks.
    Scope: 'verify_email_otp' (Default: 5/min)
    """

    scope = "verify_email_otp"


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    Rate limiter for password reset / forgot password requests.
    Scope: 'password_reset' (Default: 3/min)
    """

    scope = "password_reset"
