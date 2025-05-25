from django.urls import path

from .views import (CreateNewsView, DestroyNewsView, ListNewsView,
                    RetrieveNewsView, UpdateNewsView)

urlpatterns = [
    path('list', ListNewsView.as_view(), name='news-list'),
    path('create', CreateNewsView.as_view(), name='news-create'),
    path('<int:pk>/detail', RetrieveNewsView.as_view(), name='news-detail'),
    path('<int:pk>/update', UpdateNewsView.as_view(), name='news-update'),
    path('<int:pk>/delete', DestroyNewsView.as_view(), name='news-delete'),
]