from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup),  
    path('login/', views.login),
    path('test/', views.test_connection),      
    path('test-api/', views.test_api),
    path('', views.home, name='home'),
]