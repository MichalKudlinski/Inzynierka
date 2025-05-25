from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Costume, Element

from .serializers import CostumeSerializer, ElementSerializer


class CreateElementView(generics.CreateAPIView):
        """Tworzenie nowego elementu stroju w systemie"""
        authentication_classes = [TokenAuthentication]
        permission_classes = [IsAuthenticated]
        serializer_class = ElementSerializer
        def post(self, request, *args, **kwargs):
            serializer = self.get_serializer(data=request.data, context={"request": request})
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)
            self.perform_create(serializer)
            return Response(serializer.data, status=201)

class ListElementView(generics.ListAPIView):
        """Listowanie elementow stroju"""
        authentication_classes = [TokenAuthentication]
        permission_classes = [IsAuthenticated]
        queryset = Element.objects.all()
        serializer_class = ElementSerializer

class RetrieveElementView(generics.RetrieveAPIView):
    """Jeden element"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

class UpdateElementView(generics.UpdateAPIView):
    """Zmiana nazwy elementu"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

class DestroyElementView(generics.DestroyAPIView):
    """Usuwanie elementu"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Element.objects.all()
    serializer_class = ElementSerializer


class CreateCostumeView(generics.CreateAPIView):
    """Tworzenie nowego stroju w systemie"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CostumeSerializer

class ListCostumeView(generics.ListAPIView):
    """Listowanie strojow"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Costume.objects.all()
    serializer_class = CostumeSerializer

class RetrieveCostumeView(generics.RetrieveAPIView):
    """Szczegóły jednego stroju"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Costume.objects.all()
    serializer_class = CostumeSerializer

class UpdateCostumeView(generics.UpdateAPIView):
    """Zmiana nazwy stroju"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Costume.objects.all()
    serializer_class = CostumeSerializer

class DestroyCostumeView(generics.DestroyAPIView):
    """Usuwanie stroju"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Costume.objects.all()
    serializer_class = CostumeSerializer