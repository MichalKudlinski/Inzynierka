import json

from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.crypto import get_random_string
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import ElementStroju, Stroj, Wypozyczenie

from .serializers import WypozyczenieSerializer


class CreateWypozyczenieView(generics.CreateAPIView):
    """Tworzenie nowego Wypozyczenia w systemie"""
    permission_classes = (AllowAny,)
    serializer_class = WypozyczenieSerializer
    queryset = Wypozyczenie.objects.all()

    def post(self, request, *args, **kwargs):
        print("Incoming Request Data:", request.data)  # Debug output
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
    permission_classes = (AllowAny,)
    queryset = Wypozyczenie.objects.all()

    serializer_class = WypozyczenieSerializer

class DestroyWypozyczenieView(generics.DestroyAPIView):
    """Usuwanie stroju"""
    permission_classes = (AllowAny,)
    queryset = Wypozyczenie.objects.all()

    serializer_class = WypozyczenieSerializer

@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("name")

            if not username:
                return JsonResponse({"error": "Username is required."}, status=400)

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return JsonResponse({"error": "User not found."}, status=404)

            new_password = get_random_string(10)  # You can specify length
            user.set_password(new_password)
            user.save()

            send_mail(
                "Reset Password",
                f"Hello {user.username}, your new password is: {new_password}",
                "no-reply@example.com",
                [user.email],
                fail_silently=False,
            )

            return JsonResponse({"message": "New password sent to your email."})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)