from datetime import timedelta

from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import authentication, generics, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def send_reminders(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication credentials were not provided."}, status=401)

    if request.method != "GET":
        print("Rejected non-GET request")
        return JsonResponse({"detail": "Metoda niedozwolona."}, status=405)

    user = request.user
    today = timezone.now()
    print(f"Authenticated as user: {user.email}")
    print(f"Today's date: {today.strftime('%Y-%m-%d')}")

    # Step 1: Get related Stroje and Elementy
    user_stroje = Stroj.objects.filter(user=user)
    user_elementy = ElementStroju.objects.filter(user=user)
    print(f"Found {user_stroje.count()} Stroj instances for user")
    print(f"Found {user_elementy.count()} ElementStroju instances for user")

    # Step 2: Get matching wypozyczenia
    stroj_wypozyczenia = Wypozyczenie.objects.filter(
        zwrot__gte=today + timedelta(days=2),
        zwrot__lte=today + timedelta(days=7),
        element_stroju__in=user_elementy
    )
    print(f"Found {stroj_wypozyczenia.count()} wypozyczenia linked to user's Stroj")

    element_wypozyczenia = Wypozyczenie.objects.filter(
        zwrot__gte=today + timedelta(days=2),
        zwrot__lte=today + timedelta(days=7),
        element_stroju__in=user_elementy
    )
    print(f"Found {element_wypozyczenia.count()} wypozyczenia linked to user's ElementStroju")

    wypozyczenia = (stroj_wypozyczenia | element_wypozyczenia).distinct()
    print(f"Total distinct wypozyczenia to notify: {wypozyczenia.count()}")

    # Step 3: Send emails
    sent_count = 0
    for w in wypozyczenia:
        subject = f"Przypomnienie o wypożyczeniu - {w.id}"
        message = (
            f"Dzień dobry,\nZbliża się data zwrotu wypożyczenia "
            f"(ID {w.id}) w dniu {w.zwrot.strftime('%d-%m-%Y')}.\n"
            "Pozdrawiamy, Zespół"
        )
        print(f"Sending email to michal.kudlinski@gmail.com for wypozyczenie ID {w.id}")
        send_mail(subject, message, "kudlinski.test@gmail.com", ["michal.kudlinski@gmail.com"])
        sent_count += 1

    print(f"Emails sent: {sent_count}")
    return JsonResponse({"sent": sent_count})