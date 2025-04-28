import json

from django.contrib import auth
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import (csrf_exempt, csrf_protect,
                                          ensure_csrf_cookie)
from rest_framework import authentication, generics, permissions, status
from rest_framework.authentication import (SessionAuthentication,
                                           TokenAuthentication)
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView

from api.models import User
from user.serializers import AuthTokenSerializer, UserSerializer

# Create your views here.


@method_decorator(csrf_exempt, name='dispatch')
class CreateUserView(generics.CreateAPIView):
        """Tworzenie nowego uzytkownika w systemie"""
        permission_classes = (AllowAny,)
        serializer_class = UserSerializer



@method_decorator(ensure_csrf_cookie, name='dispatch')
class CreateTokenView(ObtainAuthToken):
        """Tworzenie nowego tokenu"""
        serializer_class = AuthTokenSerializer
        renderer_class = api_settings.DEFAULT_RENDERER_CLASSES


@method_decorator(csrf_protect, name='dispatch')
class ManageUserView(generics.RetrieveUpdateAPIView):
        """Zarzadzanie uwierzytelnionym userem"""
        serializer_class = UserSerializer
        authentication_classes = [authentication.TokenAuthentication]
        permission_classes = [permissions.IsAuthenticated]

        def get_object(self):
                return self.request.user

def reset_password(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email is required."}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "Brak użytkownika z takim adresem email."}, status=404)

            new_password = get_random_string(10)
            user.set_password(new_password)
            print(new_password)
            user.save()

            send_mail(
                "Reset hasła",
                f"Cześć {user.name}, Twoje nowe hasło to: {new_password}",
                "no-reply@example.com",
                [user.email],
                fail_silently=False,
            )

            return JsonResponse({"message": "Nowe hasło zostało wysłane na Twój email."})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Metoda niedozwolona."}, status=405)