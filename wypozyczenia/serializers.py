from datetime import datetime, timedelta

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.models import ElementStroju, Stroj, Wypozyczenie


class WypozyczenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wypozyczenie
        fields = ['id','user','stroj_nazwa', 'stroj','element_stroju','wypozyczono','zwrot','rezerwacja']
        read_only_fields = ['user']
    stroj_nazwa = serializers.CharField(source='stroj.nazwa', read_only=True)
    rezerwacja = serializers.BooleanField(required=False)

    def validate(self, data):
        # Validation logic for `stroj` and `element_stroju`
        # Ensure the test payload satisfies these conditions
        element_stroju = data.get('element_stroju')
        stroj = data.get('stroj')
        wypozyczono = data.get('wypozyczono')
        rezerwacja = data.get('rezerwacja', False)
        current_time = datetime.now()
        zwrot = data.get('zwrot')
        if zwrot:
            if isinstance(zwrot, str):  # If zwrot is a string, parse it
                try:
                    data['zwrot'] = datetime.fromisoformat(zwrot)
                except ValueError:
                    raise ValidationError("Invalid date format for zwrot, should be ISO format.")
            elif isinstance(zwrot, datetime):  # If zwrot is already a datetime object, no need to parse
                data['zwrot'] = zwrot
            else:
                raise ValidationError("zwrot must be a string or datetime object.")



        return data

    def create(self, validated_data):
        rezerwacja = validated_data.get('rezerwacja', False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        zwrot = validated_data.get('zwrot', instance.zwrot)
        instance.zwrot = zwrot
        rezerwacja = validated_data.get('rezerwacja', instance.rezerwacja)
        instance.rezerwacja = rezerwacja
        instance.save()
        return instance