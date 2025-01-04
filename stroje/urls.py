from django.urls import path, re_path
from stroje import views

app_name = 'stroje'


urlpatterns = [
    path('element/create', views.CreateElementStrojuView.as_view() ,name = 'create'),
    path('element/list', views.ListElementStrojuView.as_view(),name = 'list'),
    path('element<int:pk>/detail', views.RetrieveElementStrojuView.as_view(), name='retrieve-element-stroju'),
    path('element<int:pk>/delete', views.DestroyElementStrojuView.as_view(), name='retrieve-element-stroju'),
    path('element<int:pk>/update', views.UpdateElementStrojuView.as_view(), name='retrieve-element-stroju'),
    path('stroj/create', views.CreateStrojView.as_view() ,name = 'create'),
    path('stroj/list', views.ListStrojView.as_view(),name = 'list'),
    path('stroj<int:pk>/detail', views.RetrieveStrojView.as_view(), name='retrieve-element-stroju'),
    path('stroj<int:pk>/delete', views.DestroyStrojView.as_view(), name='retrieve-element-stroju'),
    path('stroj<int:pk>/update', views.UpdateStrojView.as_view(), name='retrieve-element-stroju'),
]

