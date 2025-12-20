from django.urls import path
from .views import AnswerListCreateView, AnswerDetailView

urlpatterns = [
    path('', AnswerListCreateView.as_view(), name='answer_list_create'),
    path('<int:pk>/', AnswerDetailView.as_view(), name='answer_detail'),
]
