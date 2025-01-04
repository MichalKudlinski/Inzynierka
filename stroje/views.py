from api.models import ElementStroju, Stroj
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ElementStrojuSerializer, StrojSerializer


class CreateElementStrojuView(generics.CreateAPIView):
        """Tworzenie nowego elementu stroju w systemie"""
        permission_classes = (AllowAny,)
        serializer_class = ElementStrojuSerializer

class ListElementStrojuView(generics.ListAPIView):
        """Listowanie elementow stroju"""
        permission_classes = (AllowAny,)
        queryset = ElementStroju.objects.all()
        serializer_class = ElementStrojuSerializer

class RetrieveElementStrojuView(generics.RetrieveAPIView):
    """Jeden element"""
    permission_classes = (AllowAny,)
    queryset = ElementStroju.objects.all()
    serializer_class = ElementStrojuSerializer

class UpdateElementStrojuView(generics.UpdateAPIView):
    """Zmiana nazwy elementu"""
    permission_classes = (AllowAny,)
    queryset = ElementStroju.objects.all()
    serializer_class = ElementStrojuSerializer

class DestroyElementStrojuView(generics.DestroyAPIView):
    """Usuwanie elementu"""
    permission_classes = (AllowAny,)
    queryset = ElementStroju.objects.all()
    serializer_class = ElementStrojuSerializer


class CreateStrojView(generics.CreateAPIView):
    """Tworzenie nowego stroju w systemie"""
    permission_classes = (AllowAny,)
    serializer_class = StrojSerializer

class ListStrojView(generics.ListAPIView):
    """Listowanie strojow"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = StrojSerializer

class RetrieveStrojView(generics.RetrieveAPIView):
    """Szczegóły jednego stroju"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = StrojSerializer

class UpdateStrojView(generics.UpdateAPIView):
    """Zmiana nazwy stroju"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = StrojSerializer

class DestroyStrojView(generics.DestroyAPIView):
    """Usuwanie stroju"""
    permission_classes = (AllowAny,)
    queryset = Stroj.objects.all()
    serializer_class = StrojSerializer