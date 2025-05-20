from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from api import models

"""
Dostosowania Django Admin
"""

# Klasa do listowania, modyfikowania i tworzenia userow w panelu admina
class UserAdmin(BaseUserAdmin):
    ordering = ['id']
    list_display = ['id', 'name', 'email']
    fieldsets = (
        (None, {'fields': ('email', 'password', 'phone_number')}),
        (
            _('Permissions'),
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'is_renter',
                )
            }
        ),
        (_('Important Dates'), {'fields': ('last_login',)}),
    )
    readonly_fields = ['last_login']
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'name',
                'is_active',
                'is_staff',
                'is_superuser',
                'is_renter',
            )
        }),
    )

admin.site.register(models.User, UserAdmin)

@admin.register(models.ElementStroju)
class ElementStrojuAdmin(admin.ModelAdmin):
    list_display = ['id', 'extid','name', 'size', 'user', 'city','element_type', 'gender','confirmed']
    search_fields = ['name', 'element_type', 'gender','image', 'confirmed']
    list_filter = ['element_type', 'gender','confirmed']

@admin.register(models.Stroj)
class StrojAdmin(admin.ModelAdmin):
    list_display = ['id', 'extid', 'name','city', 'gender', 'user',
                    'nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
                    'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka','image', 'confirmed']
    search_fields = ['name', 'gender']
    list_filter = ['gender', 'nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka', 'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka','confirmed']
    readonly_fields = ['extid']

@admin.register(models.Wypozyczenie)
class WypozyczenieAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'stroj', 'element_stroju', 'wypozyczono', 'zwrot']
    search_fields = ['user__username', 'stroj__name', 'element_stroju__name']
    list_filter = ['user', 'stroj', 'element_stroju', 'wypozyczono', 'zwrot']
    readonly_fields = ['id', 'wypozyczono']
    date_hierarchy = 'wypozyczono'

    actions = ['convert_reservation_to_rental']

    def convert_reservation_to_rental(self, request, queryset):
        updated = queryset.filter(rezerwacja=True).update(rezerwacja=False)
        self.message_user(request, f"{updated} reservations converted to rentals.")
    convert_reservation_to_rental.short_description = "Convert selected reservations to rentals"

@admin.register(models.Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'thumbnail', 'uploaded_at']
    search_fields = ['image']
    list_filter = ['uploaded_at']
    readonly_fields = ['uploaded_at', 'image_preview']

    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="150" style="object-fit: cover;" />'
        return "(No image)"
    image_preview.allow_tags = True
    image_preview.short_description = 'Preview'

    def thumbnail(self, obj):
        return self.image_preview(obj)
    thumbnail.allow_tags = True
    thumbnail.short_description = 'Thumbnail'

@admin.register(models.Wiadomosci)
class WiadomosciAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'text', 'created_at']
    search_fields = ['name', 'text']
    list_filter = ['created_at']
    readonly_fields = ['created_at']

    def short_text(self, obj):
        return (obj.text[:50] + '...') if len(obj.text) > 50 else obj.text
    short_text.short_description = 'Text Preview'

@admin.register(models.WiadomosciKontrol)
class WiadomosciKontrolAdmin(admin.ModelAdmin):
    list_display    = ['id', 'name', 'user', 'created_at']
    search_fields   = ['name', 'user__email']
    list_filter     = ['name', 'created_at']
    readonly_fields = ['created_at']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
