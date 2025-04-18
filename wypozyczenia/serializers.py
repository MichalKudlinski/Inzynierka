from datetime import datetime, timedelta

from api.models import ElementStroju, Stroj, Wypozyczenie
from django.contrib.auth.models import User
from rest_framework import serializers


class WypozyczenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wypozyczenie
        fields = '__all__'

    rezerwacja = serializers.BooleanField(required=False)

    def validate(self, data):
        # Validation logic for `stroj` and `element_stroju`
        # Ensure the test payload satisfies these conditions
        element_stroju = data.get('element_stroju')
        stroj = data.get('stroj')
        rezerwacja = data.get('rezerwacja', False)
        current_time = datetime.now()

        if stroj:
            active_wypozyczenia = Wypozyczenie.objects.filter(stroj=stroj, rezerwacja=False)
            for wypozyczenie in active_wypozyczenia:
                if current_time < wypozyczenie.zwrot:
                    raise serializers.ValidationError(f"The stroj '{stroj}' is currently unavailable for rent.")

        if element_stroju:
            active_wypozyczenia = Wypozyczenie.objects.filter(element_stroju=element_stroju, rezerwacja=False)
            for wypozyczenie in active_wypozyczenia:
                if current_time < wypozyczenie.zwrot:
                    raise serializers.ValidationError(f"The element stroju '{element_stroju}' is currently unavailable for rent.")

        # Additional validation for reservations
        if rezerwacja:
            if stroj and Wypozyczenie.objects.filter(stroj=stroj, rezerwacja=True).exists():
                raise serializers.ValidationError(f"The stroj '{stroj}' already has an active reservation.")
            if element_stroju and Wypozyczenie.objects.filter(element_stroju=element_stroju, rezerwacja=True).exists():
                raise serializers.ValidationError(f"The element stroju '{element_stroju}' already has an active reservation.")

        return data

    def create(self, validated_data):
        rezerwacja = validated_data.get('rezerwacja', False)
        if rezerwacja:
            # Set a default reservation period (e.g., 7 days from now)
            validated_data['zwrot'] = datetime.now() + timedelta(days=7)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        zwrot = validated_data.get('zwrot', instance.zwrot)
        instance.zwrot = zwrot
        instance.save()
        return instance