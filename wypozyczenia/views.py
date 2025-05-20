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

from api.models import ElementStroju, Stroj, WiadomosciKontrol, Wypozyczenie

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
    if request.method != "GET":
        return JsonResponse({"detail": "Metoda niedozwolona."}, status=405)

    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"detail": "Brak autoryzacji."}, status=401)


    seven_days_ago = timezone.now() - timedelta(days=7)
    if WiadomosciKontrol.objects.filter(
        user=user,
        name="send_reminders",
        created__gte=seven_days_ago
    ).exists():
        return JsonResponse({
            "error": "Przypomnienia były już wysyłane w ciągu ostatnich 7 dni."
        }, status=429)

    today = timezone.now()


    user_stroje = Stroj.objects.filter(user=user)
    user_elementy = ElementStroju.objects.filter(user=user)


    stroj_qs = Wypozyczenie.objects.filter(
        zwrot__gte=today + timedelta(days=2),
        zwrot__lte=today + timedelta(days=7),
        stroj__in=user_stroje
    )
    elem_qs = Wypozyczenie.objects.filter(
        zwrot__gte=today + timedelta(days=2),
        zwrot__lte=today + timedelta(days=7),
        element_stroju__in=user_elementy
    )
    wypozyczenia = (stroj_qs | elem_qs).distinct()

    sent = 0
    for w in wypozyczenia:
        subject = f"Przypomnienie o wypożyczeniu – {w.id}"
        message = (
            f"Cześć {w.user.name},\n\n"
            f"Przypomnienie o zbliżającym się terminie zwrotu stroju:\n"
            f"• ID wypożyczenia: {w.id}\n"
            f"• Data wypożyczenia: {w.wypozyczono:%d-%m-%Y}\n"
            f"• Data zwrotu: {w.zwrot:%d-%m-%Y}\n\n"
            "Pozdrawiamy,\nHeritageWear.pl"
        )
        send_mail(
            subject,
            message,
            "heritage.waer.kontakt@gmail.com",
            [w.user.email],
            fail_silently=False,
        )
        sent += 1

    # log the send_reminders event
    WiadomosciKontrol.objects.create(
        user=user,
        name="send_reminders"
    )

    return JsonResponse({"sent": sent})