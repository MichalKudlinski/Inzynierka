from api import models
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

"""
Dostosowania Django Admin
"""

# Klasa do listowania, modyfikowania i tworzenia userow w panelu admina
class UserAdmin(BaseUserAdmin):
    ordering = ['id']
    list_display = ['id', 'name', 'email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (
            _('Permissions'),
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
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
            )
        }),
    )

admin.site.register(models.User, UserAdmin)

@admin.register(models.ElementStroju)
class ElementStrojuAdmin(admin.ModelAdmin):
    list_display = ['id', 'extid','name', 'element_type', 'gender']
    search_fields = ['name', 'element_type', 'gender']
    list_filter = ['element_type', 'gender']

@admin.register(models.Stroj)
class StrojAdmin(admin.ModelAdmin):
    list_display = ['id', 'extid', 'name', 'gender',
                    'nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka',
                    'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka']
    search_fields = ['name', 'gender']
    list_filter = ['gender', 'nakrycie_glowy', 'koszula', 'spodnie', 'kamizelka', 'buty', 'akcesoria', 'bizuteria', 'halka', 'sukienka']
    readonly_fields = ['extid']

@admin.register(models.Wypozyczenie)
class WypozyczenieAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'stroj', 'element_stroju', 'wypozyczono', 'zwrot']
    search_fields = ['user__username', 'stroj__name', 'element_stroju__name']
    list_filter = ['user', 'stroj', 'element_stroju', 'wypozyczono', 'zwrot']
    readonly_fields = ['id', 'wypozyczono']
    date_hierarchy = 'wypozyczono'



