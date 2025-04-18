
from rest_framework import generics
from rest_framework.permissions import AllowAny

from api.models import Wiadomosci

from .serializers import WiadomosciSerializer


class CreateWiadomoscView(generics.CreateAPIView):
    """Tworzenie nowej wiadomości"""
    permission_classes = (AllowAny,)
    serializer_class = WiadomosciSerializer
    queryset = Wiadomosci.objects.all()


class ListWiadomoscView(generics.ListAPIView):
    """Listowanie wiadomości"""
    permission_classes = (AllowAny,)
    serializer_class = WiadomosciSerializer
    queryset = Wiadomosci.objects.all()


class RetrieveWiadomoscView(generics.RetrieveAPIView):
    """Szczegóły jednej wiadomości"""
    permission_classes = (AllowAny,)
    serializer_class = WiadomosciSerializer
    queryset = Wiadomosci.objects.all()


class UpdateWiadomoscView(generics.UpdateAPIView):
    """Aktualizacja wiadomości"""
    permission_classes = (AllowAny,)
    serializer_class = WiadomosciSerializer
    queryset = Wiadomosci.objects.all()


class DestroyWiadomoscView(generics.DestroyAPIView):
    """Usuwanie wiadomości"""
    permission_classes = (AllowAny,)
    serializer_class = WiadomosciSerializer
    queryset = Wiadomosci.objects.all()