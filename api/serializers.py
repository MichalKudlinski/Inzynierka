from rest_framework import serializers

from .models import Image, Wypozyczenie


class WypozyczenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wypozyczenie
        fields = '__all__'  # Ensure all fields, including 'rezerwacja', are included



class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'name', 'image',  'uploaded_at']