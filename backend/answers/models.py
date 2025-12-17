# answers/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from questions.models import Question  # Import Question from questions app

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    body = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers')
    creation_date = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_best_answer = models.BooleanField(default=False)
    
    # Generic relations to core models
    votes = GenericRelation('core.Vote', related_query_name='answer')
    comments = GenericRelation('core.Comment', related_query_name='answer')
    reports = GenericRelation('core.Report', related_query_name='answer')
    
    class Meta:
        ordering = ['-is_best_answer', '-creation_date']
    
    def __str__(self):
        return f"Answer to {self.question.title}"
    
    def vote_count(self):
        upvotes = self.votes.filter(vote_type='up').count()
        downvotes = self.votes.filter(vote_type='down').count()
        return upvotes - downvotes
