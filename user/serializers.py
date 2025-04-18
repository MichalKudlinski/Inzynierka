"""
Serializer dla user API View.
"""
from django.contrib.auth import authenticate, get_user_model
from django.utils.translation import gettext as _
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Serializer dla Usera"""
    class Meta:
        model = get_user_model()
        fields = ['email', 'password', 'name']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 5},
            'email': {'required': True}, 
        }

    def validate_email(self, value):
        """Check if the email is unique."""
        if get_user_model().objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        """Tworzenie Usera"""
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update usera"""
        password = validated_data.pop('password',None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save

        return user


class AuthTokenSerializer(serializers.Serializer):
    """Serializer dla tokena autoryzacji"""
    name = serializers.CharField( )
    password = serializers.CharField(
        style = {'input_type':'password'},
        trim_whitespace = False,
    )

    def validate(self,attrs):
        """Walidacja i uwierzytelnianie usera"""
        name = attrs.get('name')
        password = attrs.get('password')
        user = authenticate(
            request = self.context.get('request'),
            username = name,
            password = password,
        )
        if not user:
            msg = _('Unable to authenticate with provided credentials')
            raise serializers.ValidationError(msg, code = 'authorization')

        attrs['user'] = user
        return attrs