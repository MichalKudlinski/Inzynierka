from django.urls import path, re_path

from .views import index

urlpatterns = [
    path("", index),
    path("signup", index),
    path("login", index),
    path("main", index),
    path("rentals", index),
    path("details", index),
    path("details/<str:type>/<int:id>", index),
    path("add",index),
]