from django.urls import path
from .views import QuestionListCreateView, QuestionDetailView

urlpatterns = [
    path('', QuestionListCreateView.as_view(), name='question_list_create'),
    path('<int:pk>/', QuestionDetailView.as_view(), name='question_detail'),
]
