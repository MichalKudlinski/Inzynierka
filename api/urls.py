
from django.urls import path

from .views import ImageListView

urlpatterns = [
    path('image/list', ImageListView.as_view() ,name = 'list')
]