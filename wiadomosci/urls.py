from django.urls import path

from .views import (CreateWiadomoscView, DestroyWiadomoscView,
                    ListWiadomoscView, RetrieveWiadomoscView,
                    UpdateWiadomoscView)

urlpatterns = [
    path('wiadomosci/', ListWiadomoscView.as_view(), name='wiadomosc-list'),
    path('wiadomosci/create/', CreateWiadomoscView.as_view(), name='wiadomosc-create'),
    path('wiadomosci/<int:pk>/', RetrieveWiadomoscView.as_view(), name='wiadomosc-detail'),
    path('wiadomosci/<int:pk>/update/', UpdateWiadomoscView.as_view(), name='wiadomosc-update'),
    path('wiadomosci/<int:pk>/delete/', DestroyWiadomoscView.as_view(), name='wiadomosc-delete'),
]