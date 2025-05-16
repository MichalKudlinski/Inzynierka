from datetime import timedelta

from django.core.mail import send_mail
from django.shortcuts import render
from django.utils import timezone
from rest_framework import authentication, generics, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import ElementStroju, Stroj, Wypozyczenie

from .serializers import WypozyczenieSerializer


class CreateWypozyczenieView(generics.CreateAPIView):
    """Tworzenie nowego Wypozyczenia w systemie"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = WypozyczenieSerializer
    queryset = Wypozyczenie.objects.all()

    def post(self, request, *args, **kwargs):
        print("Incoming Request Data:", request.data)
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ListWypozyczenieView(generics.ListAPIView):
    """Listowanie Wypozyczen"""
    permission_classes = (AllowAny,)
    queryset = Wypozyczenie.objects.all()

    serializer_class = WypozyczenieSerializer

class RetrieveWypozyczenieView(generics.RetrieveAPIView):
    """Szczegóły jednego Wypozyczenia"""
    permission_classes = (AllowAny,)
    queryset = Wypozyczenie.objects.all()

    serializer_class = WypozyczenieSerializer

class UpdateWypozyczenieView(generics.UpdateAPIView):
    """Zmiana nazwy stroju"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Wypozyczenie.objects.all()

    serializer_class = WypozyczenieSerializer

class DestroyWypozyczenieView(generics.DestroyAPIView):
    """Usuwanie stroju"""
    queryset = Wypozyczenie.objects.all()
    serializer_class = WypozyczenieSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

def send_reminders(request):
        today = timezone.now()

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

