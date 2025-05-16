from django.contrib import admin
from django.urls import path

from .views import ImageListView

urlpatterns = [
    path('image/list', ImageListView.as_view() ,name = 'list'),
    path('admin/', admin.site.urls),
]