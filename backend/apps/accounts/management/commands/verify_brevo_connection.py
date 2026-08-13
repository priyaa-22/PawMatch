"""
Management command to test Brevo API connectivity and authentication credentials safely.
"""

from django.core.management.base import BaseCommand
from apps.accounts.services.email_service import EmailService


class Command(BaseCommand):
    help = (
        "Verifies Brevo API key authentication and network connectivity safely "
        "without exposing secrets or API keys."
    )

    def handle(self, *args, **options):
        result = EmailService.test_provider_connection()
        if result["success"]:
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ [SUCCESS] {result['message']} (Status Code: {result['status_code']})"
                )
            )
        else:
            self.stderr.write(
                self.style.ERROR(
                    f"✗ [FAILURE] {result['message']} "
                    f"(Reason: {result['reason']}, Status Code: {result['status_code']})"
                )
            )
