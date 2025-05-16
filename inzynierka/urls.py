"""inzynierka URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from wypozyczenia import views

urlpatterns = [
    path('create/', views.CreateWypozyczenieView.as_view(), name='create-wypozyczenie'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/schema',SpectacularAPIView.as_view(), name='api_schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name = 'api_schema'), name = 'api_docs'),
    path('api/user/', include('user.urls')),
    path('api/stroje/',include('stroje.urls')),
    path('api/wypozyczenia/',include('wypozyczenia.urls')),
    path('api/wiadomosci/', include('wiadomosci.urls')),
    path('',include('frontend.urls')),

]

urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
