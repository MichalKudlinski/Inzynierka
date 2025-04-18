from django.urls import path
from wypozyczenia import views

app_name = 'wypozyczenia'

urlpatterns = [
    path('create/', views.CreateWypozyczenieView.as_view(), name='create-wypozyczenie'),
    path('wypozyczenie/list', views.ListWypozyczenieView.as_view(), name='list'),
    path('wypozyczenie<int:pk>/detail', views.RetrieveWypozyczenieView.as_view(), name='retrieve-wypozyczenie'),
    path('wypozyczenie<int:pk>/delete', views.DestroyWypozyczenieView.as_view(), name='delete-wypozyczenie'),
    path('wypozyczenie<int:pk>/update', views.UpdateWypozyczenieView.as_view(), name='update-wypozyczenie'),
]