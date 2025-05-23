
from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from api.models import News

from .serializers import NewsSerializer


class CreateNewsView(generics.CreateAPIView):
    """Tworzenie nowej wiadomości"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NewsSerializer
    queryset = News.objects.all()


class ListNewsView(generics.ListAPIView):
    """Listowanie wiadomości"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NewsSerializer
    queryset = News.objects.all()


class RetrieveNewsView(generics.RetrieveAPIView):
    """Szczegóły jednej wiadomości"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NewsSerializer
    queryset = News.objects.all()


class UpdateNewsView(generics.UpdateAPIView):
    """Aktualizacja wiadomości"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NewsSerializer
    queryset = News.objects.all()


class DestroyNewsView(generics.DestroyAPIView):
    """Usuwanie wiadomości"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NewsSerializer
    queryset = News.objects.all()