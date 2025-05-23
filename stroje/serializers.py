from rest_framework import response, serializers

from api.models import Costume, Element


class ElementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Element
        fields = ['id', 'name', 'user','description', 'gender', 'size', 'city','element_type', 'extid','confirmed']

    def validate_gender(self, value):
        valid_genders = [choice[0] for choice in Element.GENDERS]
        if value not in valid_genders:
            raise serializers.ValidationError("Invalid gender. Must be one of: {}".format(
                ', '.join(valid_genders)))
        return value

    def validate_element_type(self, value):
        valid_types = [choice[0] for choice in Element.ELEMENT_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError("Invalid element type. Must be one of: {}".format(
                ', '.join(valid_types)))
        return value

    def create(self, validated_data):
        element_type = validated_data.get('element_type', '')


        count = Element.objects.filter(element_type=element_type).count()


        extid = f"{element_type[:2].upper()}{count + 1}"

        element = Element.objects.create(
            **validated_data,
            extid=extid
        )

        return element

    def update(self, instance, validated_data):

        name = validated_data.get('name', instance.name)


        instance.name = name

        instance.save()

        return instance



class CostumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Costume
        fields = [
            'id', 'extid', 'name', 'description', 'city', 'size', 'user', 'gender',
            'nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
            'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka', 'confirmed'
        ]

    def validate_gender(self, value):
        valid_genders = [choice[0] for choice in Costume.GENDERS]
        if value not in valid_genders:
            raise serializers.ValidationError("Invalid gender. Must be one of: {}".format(
                ', '.join(valid_genders)))
        return value

    def validate_element_assignment(self, value, field_name):
        if value is not None:
            costume = Costume.objects.filter(**{field_name: value}).exclude(pk=self.instance.pk if self.instance else None).first()

            if costume:
                raise serializers.ValidationError(f"Ten {field_name} element jest już przypisany do stroju '{costume.name}'.")

            if hasattr(value, 'element_type'):
                if value.element_type != field_name:
                    raise serializers.ValidationError(
                        f"Typ elementu '{value.element_type}' nie pasuje do pola '{field_name}'."
                    )
            else:
                raise serializers.ValidationError(f"Element nie posiada atrybutu 'type'.")

        return value

    def validate(self, attrs):

        name = attrs.get('name')
        if name:
            qs = Costume.objects.filter(name=name)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("Nazwa stroju jest już zajęta.")


        for field_name in ['nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
                           'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka']:
            element = attrs.get(field_name)
            if element:
                self.validate_element_assignment(element, field_name)

        return attrs

    def create(self, validated_data):
        gender = validated_data.get('gender', '')
        count = Costume.objects.filter(gender=gender).count()
        extid = f"{gender[:1].upper()}{count + 1}"

        costume = Costume.objects.create(
            **validated_data,
            extid=extid
        )
        return costume

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.city = validated_data.get('city', instance.city)
        instance.size = validated_data.get('size', instance.size)
        instance.user = validated_data.get('user', instance.user)
        instance.gender = validated_data.get('gender', instance.gender)


        for field_name in ['nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
                           'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka']:
            if field_name in validated_data:
                setattr(instance, field_name, validated_data[field_name])

        instance.confirmed = validated_data.get('confirmed', instance.confirmed)
        instance.save()
        return instance