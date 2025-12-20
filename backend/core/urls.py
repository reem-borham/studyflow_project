from django.urls import path
from .views import NotificationListView, TagListView, VoteCreateView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('tags/', TagListView.as_view(), name='tag_list'),
    path('votes/', VoteCreateView.as_view(), name='vote_create'),
]
