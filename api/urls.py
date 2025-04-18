from django.urls import path

from .views import ImageListView, main

urlpatterns = [
    path('home', main),
    path('image/list', ImageListView.as_view() ,name = 'list'),

]