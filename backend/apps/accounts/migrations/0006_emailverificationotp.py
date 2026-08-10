# Generated for EmailVerificationOTP on 2026-08-10

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0005_userprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmailVerificationOTP",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "otp_hash",
                    models.CharField(
                        db_index=True, max_length=128, verbose_name="otp hash"
                    ),
                ),
                (
                    "expires_at",
                    models.DateTimeField(db_index=True, verbose_name="expires at"),
                ),
                (
                    "attempts",
                    models.PositiveIntegerField(default=0, verbose_name="attempts"),
                ),
                (
                    "max_attempts",
                    models.PositiveIntegerField(default=5, verbose_name="max attempts"),
                ),
                (
                    "used_at",
                    models.DateTimeField(blank=True, null=True, verbose_name="used at"),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        db_index=True, default=True, verbose_name="is active"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="email_verification_otps",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "email verification OTP",
                "verbose_name_plural": "email verification OTPs",
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(
                        fields=["otp_hash"], name="accounts_em_otp_has_0bdebf_idx"
                    ),
                    models.Index(
                        fields=["user", "is_active"],
                        name="accounts_em_user_id_238bbc_idx",
                    ),
                    models.Index(
                        fields=["expires_at"], name="accounts_em_expires_a74a1a_idx"
                    ),
                ],
            },
        ),
    ]
