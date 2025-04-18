from api.models import ElementStroju, Stroj, Wypozyczenie
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail

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
        serializer.save()

class ListWypozyczenieView(generics.ListAPIView):
    """Listowanie Wypozyczen"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = WypozyczenieSerializer

class RetrieveWypozyczenieView(generics.RetrieveAPIView):
    """Szczegóły jednego Wypozyczenia"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = WypozyczenieSerializer

class UpdateWypozyczenieView(generics.UpdateAPIView):
    """Zmiana nazwy stroju"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = WypozyczenieSerializer

class DestroyWypozyczenieView(generics.DestroyAPIView):
    """Usuwanie stroju"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = WypozyczenieSerializer