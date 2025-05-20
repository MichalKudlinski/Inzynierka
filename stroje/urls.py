from django.urls import path, re_path

from stroje import views

urlpatterns = [
    path('element/create', views.CreateElementStrojuView.as_view() ,name = 'element-create'),
    path('element/list', views.ListElementStrojuView.as_view(),name = 'element-list'),
    path('element<int:pk>/detail', views.RetrieveElementStrojuView.as_view(), name='element-detail'),
    path('element<int:pk>/delete', views.DestroyElementStrojuView.as_view(), name='element-delete'),
    path('element<int:pk>/update', views.UpdateElementStrojuView.as_view(), name='element-update'),
    path('costume/create', views.CreateStrojView.as_view() ,name = 'create-stroj'),
    path('costume/list', views.ListStrojView.as_view(),name = 'list-stroj'),
    path('costume<int:pk>/detail', views.RetrieveStrojView.as_view(), name='retrieve-stroj'),
    path('costume<int:pk>/delete', views.DestroyStrojView.as_view(), name='delete-stroj'),
    path('costume<int:pk>/update', views.UpdateStrojView.as_view(), name='update-stroj'),
]

