# questions/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from core.models import Tag

class Question(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                             related_name='questions')
    tags = models.ManyToManyField(Tag, related_name='questions', blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)
    is_closed = models.BooleanField(default=False)
    
    # Generic Relations to core models
    votes = GenericRelation('core.Vote', related_query_name='question')
    comments = GenericRelation('core.Comment', related_query_name='question')
    reports = GenericRelation('core.Report', related_query_name='question')
    
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['views']),
        ]
    
    def __str__(self):
        return self.title
    
    def vote_count(self):
        upvotes = self.votes.filter(vote_type='up').count()
        downvotes = self.votes.filter(vote_type='down').count()
        return upvotes - downvotes
    
    def comment_count(self):
        return self.comments.count()
    
    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('question_detail', args=[str(self.id)])