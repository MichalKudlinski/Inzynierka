from rest_framework import serializers

from api.models import Wiadomosci


class WiadomosciSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wiadomosci
        fields = ['id', 'name', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']