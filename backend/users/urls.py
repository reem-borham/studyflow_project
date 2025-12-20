from django.urls import path
from . import views
from .views import RegisterView, LoginView, UserDashboardView

urlpatterns = [
    # Original authentication endpoints
    path('signup/', views.signup),  
    path('login/', views.login),
    path('test/', views.test_connection),      
    path('test-api/', views.test_api),
    path('', views.home, name='home'),
    
    # New class-based views from your friend
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
]