from datetime import timedelta

from django.core.mail import send_mail
from django.utils import timezone
from django_cron import CronJobBase, Schedule

from api.models import Wypozyczenie


class CheckWypozyczenieCronJob(CronJobBase):
    # This will run once every day (every 24 hours)
    schedule = Schedule(run_every_mins=1440)  # 1440 minutes = 24 hours
    code = 'your_app.check_wypozyczenie_cron'  # A unique identifier

    def do(self):
        today = timezone.now()
        wypozyczenia = Wypozyczenie.objects.filter(
            zwrot__gte=today + timedelta(days=2),
            zwrot__lte=today + timedelta(days=7)
        )

        for wypozyczenie in wypozyczenia:
            user = wypozyczenie.user  # assuming each Wypozyczenie has a user
            subject = f"Przypomnienie o wypożyczeniu - {wypozyczenie.id}"
            message = f"""Dzień dobry,Zbliża się data zwrotu wypożyczenia o ID {wypozyczenie.id}. Data zwrotu: {wypozyczenie.zwrot.strftime('%d-%m-%Y')}
                        Proszę o zwrócenie stroju w terminie.
                        Pozdrawiamy, Twój Zespół"""
            from_email = "kudlinski.test@gmail.com"
            recipient_list = 'michal.kudlinski@gmail.com'
            send_mail(subject, message, from_email, recipient_list)
            print(f"Email sent to {user.email} for Wypozyczenie ID={wypozyczenie.id}")