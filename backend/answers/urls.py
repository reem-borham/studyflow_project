from django.urls import path
from .views import AnswerListCreateView

urlpatterns = [
    path('', AnswerListCreateView.as_view(), name='answer_list_create'),
]
