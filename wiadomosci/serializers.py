from rest_framework import serializers

from api.models import News


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ['id', 'name', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']