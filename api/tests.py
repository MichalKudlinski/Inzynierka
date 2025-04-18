from datetime import datetime, timedelta

from django.core import mail
from django.test import TestCase

from api.models import ElementStroju, Stroj, User, Wypozyczenie


class EmailTestCase(TestCase):


    def test_wypozyczenie_creation_email(self):
        """Test email is sent when a new Wypozyczenie is created."""
        user = User.objects.create_user(email="test@example.com", name="Test User", password="password")
        stroj = Stroj.objects.create(name="Test Stroj", gender="meski")
        wypozyczenie = Wypozyczenie.objects.create(
            user=user,
            stroj=stroj,
            wypozyczono=datetime.now(),
            zwrot=datetime.now() + timedelta(days=7),
            rezerwacja=False
        )
        # Check the correct email subject
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Potwierdzenie Wypożyczenia", mail.outbox[0].subject)

