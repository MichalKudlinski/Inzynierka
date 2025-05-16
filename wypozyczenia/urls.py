from django.urls import path

from wypozyczenia import views

urlpatterns = [
    path('create/', views.CreateWypozyczenieView.as_view(), name='wypozyczenie-create'),
    path('list/', views.ListWypozyczenieView.as_view(), name='wypozyczenie-list'),
    path('<int:pk>/', views.RetrieveWypozyczenieView.as_view(), name='wypozyczenie-detail'),
    path('<int:pk>/update/', views.UpdateWypozyczenieView.as_view(), name='wypozyczenie-update'),
    path('<int:pk>/delete/', views.DestroyWypozyczenieView.as_view(), name='wypozyczenie-delete'),
]