from rest_framework import serializers
from .models import Notification, Tag, Vote, Comment, Report
from django.contrib.contenttypes.models import ContentType

class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'message', 'is_read', 'created_at', 'link', 'actor_username']
        read_only_fields = ['user', 'created_at', 'actor_username']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'description', 'usage_count']
        read_only_fields = ['usage_count']

class VoteSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Vote
        fields = ['id', 'user', 'username', 'vote_type', 'content_type', 'object_id', 'timestamp']
        read_only_fields = ['user', 'timestamp', 'username']

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    replies_count = serializers.SerializerMethodField()
    content_type = serializers.IntegerField(write_only=True, required=False)
    object_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'content', 'created_at', 'updated_at', 
                  'is_edited', 'content_type', 'object_id', 'parent_comment', 'replies_count']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_edited', 'username']
    
    def get_replies_count(self, obj):
        return obj.replies.count()

class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_username', 'report_type', 'description', 
                  'status', 'created_at', 'resolved_at', 'resolved_by', 'resolved_by_username', 'admin_notes']
        read_only_fields = ['reporter', 'created_at', 'resolved_at', 'resolved_by', 
                           'reporter_username', 'resolved_by_username']
