from django.http import HttpResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import (csrf_exempt, csrf_protect,
                                          ensure_csrf_cookie)
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Image
from .serializers import ImageSerializer, WypozyczenieSerializer

# Create your views here.

def main(request):
    return HttpResponse("Hello")
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CreateWypozyczenieView(generics.CreateAPIView):
    """Tworzenie nowego Wypozyczenia w systemie"""
    permission_classes = (AllowAny,)
    serializer_class = WypozyczenieSerializer

    def perform_create(self, serializer):
        # Additional logic for reservations if needed
        serializer.save()


class ImageListView(generics.ListAPIView):
    def get(self, request):
        images = Image.objects.all()
        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data)