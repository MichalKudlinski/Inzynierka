from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.models import Costume, Element, Rental


class WypozyczenieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = ['id','user','costume_name', 'costume','element','rented','return_date','reservation']
        read_only_fields = ['user']
    costume_name = serializers.CharField(source='costume.name', read_only=True)
    reservation = serializers.BooleanField(required=False)

    def validate(self, data):
        element = data.get('element')
        costume = data.get('costume')
        rented = data.get('rented')
        reservation = data.get('reservation', False)
        current_time = datetime.now()
        return_date = data.get('return_date')
        if return_date:
            if isinstance(return_date, str):
                try:
                    data['return_date'] = datetime.fromisoformat(return_date)
                except ValueError:
                    raise ValidationError("Invalid date format for zwrot, should be ISO format.")
            elif isinstance(return_date, datetime):
                data['return_date'] = return_date
            else:
                raise ValidationError("zwrot must be a string or datetime object.")

        return data

    def create(self, validated_data):
        reservation = validated_data.get('reservation', False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return_date = validated_data.get('return_date', instance.return_date    )
        instance.return_date = return_date
        reservation = validated_data.get('reservation', instance.reservation)
        instance.reservation = reservation
        instance.save()
        return instance



