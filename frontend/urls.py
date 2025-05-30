from django.urls import path

from .views import index

urlpatterns = [
        #początkowa
        path("", index),
        #rejestracja
        path("signup", index),
        #logowanie
        path("login", index),
        #główna
        path("main", index),
        #wypożyczenia
        path("rentals", index),
        #szczegóły
        path("details/<str:type>/<int:id>", index),
        #dodawanie
        path("add",index),
    ]


