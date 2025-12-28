from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserDashboardView, UserAvatarUploadView, PopularTagsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('upload-profile-image/', UserAvatarUploadView.as_view(), name='upload_profile_image'),
    path('tags/popular/', PopularTagsView.as_view(), name='popular_tags'),
]