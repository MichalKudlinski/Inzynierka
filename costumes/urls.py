from django.urls import path, re_path

from costumes import views

urlpatterns = [
    path('element/create', views.CreateElementView.as_view() ,name = 'element-create'),
    path('element/list', views.ListElementView.as_view(),name = 'element-list'),
    path('element<int:pk>/detail', views.RetrieveElementView.as_view(), name='element-detail'),
    path('element<int:pk>/delete', views.DestroyElementView.as_view(), name='element-delete'),
    path('element<int:pk>/update', views.UpdateElementView.as_view(), name='element-update'),
    path('costume/create', views.CreateCostumeView.as_view() ,name = 'create-costume'),
    path('costume/list', views.ListCostumeView.as_view(),name = 'list-costume'),
    path('costume<int:pk>/detail', views.RetrieveCostumeView.as_view(), name='retrieve-costume'),
    path('costume<int:pk>/delete', views.DestroyCostumeView.as_view(), name='delete-costume'),
    path('costume<int:pk>/update', views.UpdateCostumeView.as_view(), name='update-costume'),
]

