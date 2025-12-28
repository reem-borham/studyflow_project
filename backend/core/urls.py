from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    TagListCreateView,
    TagDetailView,
    VoteCreateView,
    VoteListView,
    CommentListCreateView,
    CommentDetailView,
    MarkBestAnswerView,
    ReportCreateView,
    ReportListView,
    ReportResolveView,
)

urlpatterns = [
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/mark-read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
    
    # Tags
    path('tags/', TagListCreateView.as_view(), name='tag_list_create'),
    path('tags/<int:pk>/', TagDetailView.as_view(), name='tag_detail'),
    
    # Voting
    path('votes/', VoteCreateView.as_view(), name='vote_create'),
    path('votes/list/', VoteListView.as_view(), name='vote_list'),
    
    # Comments
    path('comments/', CommentListCreateView.as_view(), name='comment_list_create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment_detail'),
    
    # Best Answer
    path('answers/<int:answer_id>/mark-best/', MarkBestAnswerView.as_view(), name='mark_best_answer'),
    
    # Reporting
    path('reports/', ReportCreateView.as_view(), name='report_create'),
    path('reports/list/', ReportListView.as_view(), name='report_list'),
    path('reports/<int:report_id>/resolve/', ReportResolveView.as_view(), name='report_resolve'),
]
