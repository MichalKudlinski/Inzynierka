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

from api.models import ControlMessage, Costume, Element, Rental

from .serializers import WypozyczenieSerializer


class CreateRentalView(generics.CreateAPIView):
    """Tworzenie nowego Wypozyczenia w systemie"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = WypozyczenieSerializer
    queryset = Rental.objects.all()

    def post(self, request, *args, **kwargs):
        print("Incoming Request Data:", request.data)
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ListRentalView(generics.ListAPIView):
    """Listowanie Wypozyczen"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Rental.objects.all()

    serializer_class = WypozyczenieSerializer

class RetrieveRentalView(generics.RetrieveAPIView):
    """Szczegóły jednego Wypozyczenia"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Rental.objects.all()

    serializer_class = WypozyczenieSerializer

class UpdateRentalView(generics.UpdateAPIView):
    """Zmiana nazwy stroju"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Rental.objects.all()

    serializer_class = WypozyczenieSerializer

class DestroyRentalView(generics.DestroyAPIView):
    """Usuwanie stroju"""
    queryset = Rental.objects.all()
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
    if ControlMessage.objects.filter(
        user=user,
        name="send_reminders",
        created_at__gte=seven_days_ago
    ).exists():
        return JsonResponse({
            "error": "Przypomnienia były już wysyłane w ciągu ostatnich 7 dni."
        }, status=429)

    today = timezone.now()


    user_costumes = Costume.objects.filter(user=user)
    user_elements = Element.objects.filter(user=user)


    stroj_qs = Rental.objects.filter(
        return_date__gte=today + timedelta(days=2),
        return_date__lte=today + timedelta(days=7),
        costume__in=user_costumes
    )
    elem_qs = Rental.objects.filter(
        return_date__gte=today + timedelta(days=2),
        return_date__lte=today + timedelta(days=7),
        element__in=user_elements
    )
    rentals = (stroj_qs | elem_qs).distinct()

    sent = 0
    for r in rentals:
        subject = f"Przypomnienie o wypożyczeniu – {r.id}"
        message = (
            f"Cześć {r.user.name},\n\n"
            f"Przypomnienie o zbliżającym się terminie zwrotu stroju:\n"
            f"• ID wypożyczenia: {r.id}\n"
            f"• Data wypożyczenia: {r.rented:%d-%m-%Y}\n"
            f"• Data zwrotu: {r.return_date:%d-%m-%Y}\n\n"
            "Pozdrawiamy,\nHeritageWear.pl"
        )
        send_mail(
            subject,
            message,
            "heritage.waer.kontakt@gmail.com",
            ["michal.kudlinski@gmail.com"],
            fail_silently=False,
        )
        sent += 1


    ControlMessage.objects.create(
        user=user,
        name="send_reminders"
    )

    return JsonResponse({"sent": sent})