from django.urls import path

from .views import (CreateNewsView, DestroyNewsView, ListNewsView,
                    RetrieveNewsView, UpdateNewsView)

urlpatterns = [
    #Listowanie wiadomości
    path('list', ListNewsView.as_view(), name='news-list'),
    #Tworzenie wiadomości
    path('create', CreateNewsView.as_view(), name='news-create'),
    #Szczegóły wiadomości
    path('<int:pk>/detail', RetrieveNewsView.as_view(), name='news-detail'),
    #Zmiana danych wiadomości
    path('<int:pk>/update', UpdateNewsView.as_view(), name='news-update'),
    #Usuwanie wiadomości
    path('<int:pk>/delete', DestroyNewsView.as_view(), name='news-delete'),
]


