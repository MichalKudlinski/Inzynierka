from datetime import timedelta

from django.core.mail import send_mail
from django.utils import timezone
from django_cron import CronJobBase, Schedule

from api.models import Wypozyczenie


class CheckWypozyczenieCronJob(CronJobBase):
    schedule = Schedule(run_every_mins=1)
    code = 'inzynierka.cron.CheckWypozyczenieCronJob'

    def do(self):

        today = timezone.now()
        print(f"Cron job started at {today.strftime('%d-%m-%Y %H:%M:%S')}")

        wypozyczenia = Wypozyczenie.objects.filter(
            zwrot__gte=today + timedelta(days=2),
            zwrot__lte=today + timedelta(days=7)
        )


        print(f"Found {wypozyczenia.count()} Wypozyczenie records to process")

        for wypozyczenie in wypozyczenia:
            print(f"Processing Wypozyczenie ID={wypozyczenie.id} for user {wypozyczenie.user.email}")

            user = wypozyczenie.user
            subject = f"Przypomnienie o wypożyczeniu - {wypozyczenie.id}"
            message = f"""Dzień dobry, Zbliża się data zwrotu wypożyczenia o ID {wypozyczenie.id}.
            Data zwrotu: {wypozyczenie.zwrot.strftime('%d-%m-%Y')}
            Proszę o zwrócenie stroju w terminie. Jeśli chcesz wydłużyć swoje wypożyczenie, odpowiedz na ten mail.
            Pozdrawiamy, Twój Zespół"""

            from_email = "kudlinski.test@gmail.com"
            recipient_list = ['michal.kudlinski@gmail.com']


            send_mail(subject, message, from_email, recipient_list)
            print(f"Email sent to {wypozyczenie.user.email} for Wypozyczenie ID={wypozyczenie.id}")

        print("Cron job completed")