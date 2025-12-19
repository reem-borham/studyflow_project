# core/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.core.exceptions import ValidationError


# =====================================================
# TAGS MODEL 
# =====================================================
class Tag(models.Model):
    """
    Tags for categorizing questions
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    def increment_usage(self):
        """Increment usage count when tag is used"""
        self.usage_count += 1
        self.save()


# =====================================================
# VOTES MODEL (Generic Foreign Key)
# =====================================================
class Vote(models.Model):
    """
    Votes for any content type (questions, answers, comments)
    Using Generic Foreign Key
    """
    VOTE_TYPE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=10, choices=VOTE_TYPE_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Generic Foreign Key - can vote on ANY model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    class Meta:
        # Prevent duplicate voting on same content
        unique_together = ('user', 'content_type', 'object_id')
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.vote_type} by {self.user.username} on {self.content_object}"
    
    def clean(self):
        """Validate that content_object exists and is voteable"""
        if not self.content_object:
            raise ValidationError("Cannot vote on non-existent content")
    
    @property
    def is_upvote(self):
        return self.vote_type == 'up'
    
    @property
    def is_downvote(self):
        return self.vote_type == 'down'


# =====================================================
# COMMENTS MODEL (Generic Foreign Key)
# =====================================================
class Comment(models.Model):
    """
    Comments for any content type (questions, answers)
    Using Generic Foreign Key
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    
    # Generic Foreign Key - can comment on ANY model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, 
                                     limit_choices_to={'model__in': ['question', 'answer']})
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # For threaded comments (optional)
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, 
                                       related_name='replies')
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.username}"
    
    def save(self, *args, **kwargs):
        if self.pk:  # If updating existing comment
            self.is_edited = True
        super().save(*args, **kwargs)


# =====================================================
# NOTIFICATIONS MODEL (Generic Foreign Key)
# =====================================================
class Notification(models.Model):
    """
    Notifications for users about various activities
    Using Generic Foreign Key for content reference
    """
    NOTIFICATION_TYPE_CHOICES = [
        ('answer', 'New Answer'),
        ('comment', 'New Comment'),
        ('vote', 'New Vote'),
        ('best_answer', 'Best Answer Selected'),
        ('mention', 'Mention'),
        ('follow', 'New Follower'),
        ('report_resolved', 'Report Resolved'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                             related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    # Link to navigate to the content
    link = models.URLField(blank=True)
    
    # Generic Foreign Key - reference to the content that triggered notification
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, 
                                     null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Actor (who caused the notification)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                              null=True, blank=True, related_name='caused_notifications')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} notification for {self.user.username}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save()
    
    @property
    def is_unread(self):
        return not self.is_read


# =====================================================
# REPORTS MODEL (Generic Foreign Key)
# =====================================================
class Report(models.Model):
    """
    Reports for inappropriate content
    Using Generic Foreign Key
    """
    REPORT_TYPE_CHOICES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
        ('copyright', 'Copyright Violation'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved - No Action'),
        ('removed', 'Resolved - Content Removed'),
        ('dismissed', 'Dismissed'),
    ]
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                                 related_name='reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Generic Foreign Key - can report ANY model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Admin fields
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                    null=True, blank=True, related_name='resolved_reports')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Report by {self.reporter.username} on {self.content_object}"
    
    def resolve(self, admin_user, status='resolved', notes=''):
        """Mark report as resolved"""
        self.status = status
        self.resolved_by = admin_user
        self.resolved_at = timezone.now()
        self.admin_notes = notes
        self.save()
    
    @property
    def is_resolved(self):
        return self.status in ['resolved', 'removed', 'dismissed']

