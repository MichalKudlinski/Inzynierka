
from django.urls import path

from user import views

urlpatterns = [
    #Tworzenie użytkownika
    path('create', views.CreateUserView.as_view(),name = 'create'),
    #Tworzenie tokenu
    path('token', views.CreateTokenView.as_view(),name = 'token'),
    #Pobieranie tokenu autoryzacji i danych o użytkowniku
    path('me',views.ManageUserView.as_view(),name = 'me'),
    #Adres do wywołania metody reset_password
    path('reset-password', views.reset_password, name='reset-password'),
]

