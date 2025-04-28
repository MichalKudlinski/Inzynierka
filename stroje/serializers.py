from rest_framework import serializers

from api.models import ElementStroju, Stroj


class ElementStrojuSerializer(serializers.ModelSerializer):

    class Meta:
        model = ElementStroju
        fields = ['id', 'name', 'user','description', 'gender', 'size', 'element_type', 'extid']

    def validate_gender(self, value):
        valid_genders = [choice[0] for choice in ElementStroju.GENDERS]
        if value not in valid_genders:
            raise serializers.ValidationError("Invalid gender. Must be one of: {}".format(
                ', '.join(valid_genders)))
        return value

    def validate_element_type(self, value):
        valid_types = [choice[0] for choice in ElementStroju.ELEMENT_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError("Invalid element type. Must be one of: {}".format(
                ', '.join(valid_types)))
        return value

    def create(self, validated_data):
        element_type = validated_data.get('element_type', '')


        count = ElementStroju.objects.filter(element_type=element_type).count()


        extid = f"{element_type[:2].upper()}{count + 1}"

        element_stroju = ElementStroju.objects.create(
            **validated_data,
            extid=extid
        )

        return element_stroju

    def update(self, instance, validated_data):

        name = validated_data.get('name', instance.name)


        instance.name = name

        instance.save()

        return instance


class StrojSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stroj
        fields = ['id', 'extid', 'name', 'description','city','size','user','gender',
                  'nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
                  'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka']

    def validate_gender(self, value):
        valid_genders = [choice[0] for choice in Stroj.GENDERS]
        if value not in valid_genders:
            raise serializers.ValidationError("Invalid gender. Must be one of: {}".format(
                ', '.join(valid_genders)))
        return value

    def validate_element_assignment(self, value, field_name):
        if value is not None:
            stroj = Stroj.objects.filter(**{field_name: value}).first()
            if stroj:
                raise serializers.ValidationError(f"Ten {field_name} element jest juz przypisany do stroju '{stroj.name}'.")
        return value
    def validate(self, attrs):
        for field_name in ['nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
                           'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka']:
            element = attrs.get(field_name, None)
            if element:
                self.validate_element_assignment(element, field_name)

        return attrs
    def create(self, validated_data):
        gender = validated_data.get('gender', '')
        count = Stroj.objects.filter(gender=gender).count()
        extid = f"{gender[:1].upper()}{count + 1}"

        stroj = Stroj.objects.create(
            **validated_data,
            extid=extid
        )

        return stroj

    def update(self, instance, validated_data):

        name = validated_data.get('name', instance.name)
        instance.name = name
        instance.save()
        return instance