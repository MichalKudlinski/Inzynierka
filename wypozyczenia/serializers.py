from datetime import datetime

from api.models import ElementStroju, Stroj, Wypozyczenie
from django.contrib.auth.models import User
from rest_framework import serializers


class WypozyczenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wypozyczenie
        fields = ['id', 'user', 'element_stroju', 'stroj', 'wypozyczono', 'zwrot']
    def validate(self, data):

        element_stroju = data.get('element_stroju')
        stroj = data.get('stroj')

        current_time = datetime.now()

        if stroj:
            active_wypozyczenia = Wypozyczenie.objects.filter(stroj=stroj)
            for wypozyczenie in active_wypozyczenia:

                if current_time < wypozyczenie.zwrot:
                    raise serializers.ValidationError(f"The stroj '{stroj}' is currently unavailable for rent.")


        if element_stroju:
            active_wypozyczenia = Wypozyczenie.objects.filter(element_stroju=element_stroju)
            for wypozyczenie in active_wypozyczenia:

                if current_time < wypozyczenie.zwrot:
                    raise serializers.ValidationError(f"The element stroju '{element_stroju}' is currently unavailable for rent.")

        return data
    def create(self, validated_data):
        """Override to customize creation logic if needed."""
        return Wypozyczenie.objects.create(**validated_data)

    def update(self, instance, validated_data):

        zwrot = validated_data.get('zwrot', instance.name)
        instance.zwrot = zwrot
        instance.save()
        return instance