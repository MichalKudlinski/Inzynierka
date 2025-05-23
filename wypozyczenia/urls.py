from django.urls import path

from wypozyczenia import views

urlpatterns = [
    path('create/', views.CreateRentalView.as_view(), name='rental-create'),
    path('list/', views.ListRentalView.as_view(), name='rental-list'),
    path('<int:pk>/', views.RetrieveRentalView.as_view(), name='rental-detail'),
    path('<int:pk>/update/', views.UpdateRentalView.as_view(), name='rental-update'),
    path('<int:pk>/delete/', views.DestroyRentalView.as_view(), name='rental-delete'),
    path('send-reminders/', views.send_reminders, name='send-reminders'),
]