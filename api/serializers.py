from rest_framework import serializers

from .models import Image, Wypozyczenie


class WypozyczenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wypozyczenie
        fields = ['user', 'stroj','element_stroju','wypozyczono','zwrot','rezerwacja'] # Ensure all fields, including 'rezerwacja', are included



class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'name', 'image',  'uploaded_at']
        def get_photo_url(self, obj):
            request = self.context.get('request')
            photo_url = obj.fingerprint.url
            return request.build_absolute_url(photo_url)