
# core/models.py
from django.db import models
from django.conf import settings  # Use settings.AUTH_USER_MODEL
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    usage_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class Vote(models.Model):
    VOTE_TYPE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_TYPE_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Generic foreign key for voting on questions OR answers
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    class Meta:
        unique_together = ('user', 'content_type', 'object_id')
    
    def __str__(self):
        return f"{self.vote_type} by {self.user.username}"


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)
    
    # Generic foreign key for commenting on questions OR answers
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return f"Comment by {self.user.username}"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('reply', 'Reply'),
        ('like', 'Like'),
        ('follow', 'Follow'),
        ('best_answer', 'Best Answer'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)
    link = models.URLField(blank=True)
    
    # Reference to the content
    content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return f"{self.notification_type} notification"


class Report(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
    ]
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Generic foreign key for reporting questions, answers, or comments
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return f"Report by {self.reporter.username}"