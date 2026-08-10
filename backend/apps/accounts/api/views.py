"""
REST API views for PawMatch Authentication, User Registration, Email Verification, Profile Management & Password Management.
"""

from rest_framework import status
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.api.serializers import (
    ChangePasswordSerializer,
    CurrentUserSerializer,
    DeactivateAccountSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    ResendVerificationOTPSerializer,
    ResetPasswordSerializer,
    UpdateProfileSerializer,
    UploadAvatarSerializer,
    UserProfileResponseSerializer,
    VerifyEmailOTPSerializer,
)
from apps.accounts.constants import AuditAction, AuthMessage
from apps.accounts.services.authentication_service import AuthenticationService
from apps.accounts.services.password_service import PasswordService
from apps.accounts.services.profile_service import ProfileService
from apps.accounts.services.registration_service import RegistrationService
from apps.accounts.throttles import (
    LoginAnonRateThrottle,
    LoginUserRateThrottle,
    PasswordResetRateThrottle,
    RegisterRateThrottle,
    ResendVerificationRateThrottle,
    VerifyEmailOTPRateThrottle,
)
from apps.audit_logs.services.audit_service import AuditService
from apps.core.responses import api_response


class ChangePasswordAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/change-password/
    Allows authenticated users to change their password with current password verification.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        PasswordService.change_password(
            user=request.user,
            current_password=serializer.validated_data["current_password"],
            new_password=serializer.validated_data["new_password"],
            confirm_password=serializer.validated_data["confirm_password"],
            request=request,
        )

        return api_response(
            success=True,
            message=AuthMessage.PASSWORD_CHANGED_SUCCESS,
            status_code=status.HTTP_200_OK,
        )


class ForgotPasswordAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/forgot-password/
    Initiates password reset workflow. Always returns generic success response to prevent user enumeration.
    """

    permission_classes = (AllowAny,)
    throttle_classes = (PasswordResetRateThrottle,)
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        PasswordService.forgot_password(
            email=serializer.validated_data["email"], request=request
        )

        return api_response(
            success=True,
            message=AuthMessage.FORGOT_PASSWORD_SUCCESS,
            status_code=status.HTTP_200_OK,
        )


class ResetPasswordAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/reset-password/
    Resets user password using cryptographically verified AccountToken.
    """

    permission_classes = (AllowAny,)
    throttle_classes = (PasswordResetRateThrottle,)
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        PasswordService.reset_password(
            raw_token=serializer.validated_data["token"],
            new_password=serializer.validated_data["new_password"],
            confirm_password=serializer.validated_data["confirm_password"],
            request=request,
        )

        return api_response(
            success=True,
            message=AuthMessage.PASSWORD_RESET_SUCCESS,
            status_code=status.HTTP_200_OK,
        )


class UserProfileAPIView(GenericAPIView):
    """
    GET /api/v1/accounts/profile/
    PATCH /api/v1/accounts/profile/
    Retrieves or partially updates current authenticated user profile.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        _, profile = ProfileService.get_profile(request.user)
        serializer = UserProfileResponseSerializer(
            profile, context={"request": request}
        )
        return api_response(
            success=True,
            message=AuthMessage.PROFILE_RETRIEVED_SUCCESS,
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )

    def patch(self, request, *args, **kwargs):
        serializer = UpdateProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        profile = ProfileService.update_profile(
            user=request.user, data=serializer.validated_data, request=request
        )

        response_serializer = UserProfileResponseSerializer(
            profile, context={"request": request}
        )
        return api_response(
            success=True,
            message=AuthMessage.PROFILE_UPDATED_SUCCESS,
            data=response_serializer.data,
            status_code=status.HTTP_200_OK,
        )


class UploadAvatarAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/profile/avatar/
    DELETE /api/v1/accounts/profile/avatar/
    Uploads or deletes current authenticated user avatar image.
    """

    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = UploadAvatarSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        avatar_url = ProfileService.upload_avatar(
            user=request.user,
            avatar_file=serializer.validated_data["avatar"],
            request=request,
        )

        return api_response(
            success=True,
            message=AuthMessage.AVATAR_UPLOADED_SUCCESS,
            data={"avatar": avatar_url},
            status_code=status.HTTP_200_OK,
        )

    def delete(self, request, *args, **kwargs):
        ProfileService.delete_avatar(user=request.user, request=request)
        return api_response(
            success=True,
            message=AuthMessage.AVATAR_DELETED_SUCCESS,
            data={"avatar": ""},
            status_code=status.HTTP_200_OK,
        )


class DeactivateAccountAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/deactivate/
    Deactivates current user account after password verification.
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = DeactivateAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ProfileService.deactivate_account(
            user=request.user,
            password=serializer.validated_data["password"],
            request=request,
        )

        return api_response(
            success=True,
            message=AuthMessage.ACCOUNT_DEACTIVATED_SUCCESS,
            status_code=status.HTTP_200_OK,
        )


class RegisterAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/register/
    Registers a new inactive user, generates an email verification token,
    and dispatches a verification email.
    """

    permission_classes = (AllowAny,)
    throttle_classes = (RegisterRateThrottle,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, _, _ = RegistrationService.register_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data["last_name"],
            request=request,
        )

        user_data = CurrentUserSerializer(user, context={"request": request}).data

        return api_response(
            success=True,
            message=AuthMessage.REGISTRATION_SUCCESS,
            data={"user": user_data},
            status_code=status.HTTP_201_CREATED,
        )


class VerifyEmailOTPAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/verify-email-otp/
    Validates 6-digit verification OTP, activates user account, and dispatches a welcome email.
    """

    permission_classes = (AllowAny,)
    throttle_classes = (VerifyEmailOTPRateThrottle,)
    serializer_class = VerifyEmailOTPSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = RegistrationService.verify_email_otp(
            email=serializer.validated_data["email"],
            raw_otp=serializer.validated_data["otp"],
            request=request,
        )
        user_data = CurrentUserSerializer(user, context={"request": request}).data

        return api_response(
            success=True,
            message=AuthMessage.EMAIL_VERIFIED_SUCCESS,
            data={"user": user_data},
            status_code=status.HTTP_200_OK,
        )


class ResendVerificationOTPAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/resend-verification-otp/
    Invalidates previous OTPs, generates a fresh 6-digit OTP, and resends verification email.
    """

    permission_classes = (AllowAny,)
    throttle_classes = (ResendVerificationRateThrottle,)
    serializer_class = ResendVerificationOTPSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        RegistrationService.resend_verification_otp(
            email=serializer.validated_data["email"], request=request
        )

        return api_response(
            success=True,
            message=AuthMessage.VERIFICATION_RESENT_SUCCESS,
            status_code=status.HTTP_200_OK,
        )


class LoginAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/login/
    Authenticates user credentials and returns JWT access & refresh tokens along with user info.
    Protected by DRF rate limiting throttles against brute-force attacks.
    """

    permission_classes = (AllowAny,)
    throttle_classes = (LoginAnonRateThrottle, LoginUserRateThrottle)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user, tokens = AuthenticationService.authenticate_user(
            email=email, password=password, request=request
        )

        user_data = CurrentUserSerializer(user, context={"request": request}).data

        return api_response(
            success=True,
            message=AuthMessage.LOGIN_SUCCESS,
            data={
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "user": user_data,
            },
            status_code=status.HTTP_200_OK,
        )


class LogoutAPIView(GenericAPIView):
    """
    POST /api/v1/accounts/logout/
    Blacklists the provided refresh token and terminates active user session.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = serializer.validated_data["refresh"]
        AuthenticationService.logout_user(
            refresh_token_str=refresh_token, user=request.user, request=request
        )

        return api_response(
            success=True,
            message=AuthMessage.LOGOUT_SUCCESS,
            status_code=status.HTTP_200_OK,
        )


class CurrentUserAPIView(RetrieveAPIView):
    """
    GET /api/v1/accounts/me/
    Returns current authenticated user profile details.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(
            success=True,
            message=AuthMessage.CURRENT_USER_RETRIEVED,
            data=serializer.data,
            status_code=status.HTTP_200_OK,
        )


class CustomTokenRefreshView(TokenRefreshView):
    """
    POST /api/v1/accounts/token/refresh/
    Exposes token refresh endpoint with rotated refresh tokens and security audit logging.
    """

    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            user_id = (
                getattr(request.user, "id", None)
                if hasattr(request, "user") and request.user.is_authenticated
                else None
            )
            AuditService.log_event(
                action=AuditAction.TOKEN_REFRESH_SUCCESS,
                request=request,
                user_id=user_id,
                status="SUCCESS",
            )
            return api_response(
                success=True,
                message=AuthMessage.TOKEN_REFRESH_SUCCESS,
                data=response.data,
                status_code=status.HTTP_200_OK,
            )
        except Exception as exc:
            AuditService.log_event(
                action=AuditAction.TOKEN_REFRESH_FAILED,
                request=request,
                status="FAILED",
                details={"reason": "Invalid or expired refresh token."},
            )
            raise exc
