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

urlpatterns = [
    #URL panelu administratora
    path('admin/', admin.site.urls),
    #URL pobrane z komponentu api
    path('api/', include('api.urls')),
    #URL schematu OpenAPI
    path('api/schema',SpectacularAPIView.as_view(), name='api_schema'),
    #URL dokumentacji schematu OpenAPI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name = 'api_schema'), name = 'api_docs'),
    #URL pobrane z komponentu user
    path('api/user/', include('user.urls')),
    #URL pobrane z komponentu costumes
    path('api/costumes/',include('costumes.urls')),
    #URL pobrane z komponentu rentals
    path('api/rentals/',include('rentals.urls')),
    #URL pobrane z komponentu news
    path('api/news/', include('news.urls')),
    #URL pobrane z komponentu frontend
    path('',include('frontend.urls')),

]
#Dodanie ścieżek URL dla plików statycznych i multimedialnych
urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
