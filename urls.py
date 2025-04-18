from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/wypozyczenia/', include('wypozyczenia.urls')),  # Include wypozyczenia URLs
    # ...other app URLs...
]
