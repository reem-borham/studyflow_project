from rest_framework import serializers
from .models import Notification, Tag, Vote

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
    class Meta:
        model = Vote
        fields = ['id', 'user', 'vote_type', 'content_type', 'object_id', 'timestamp']
        read_only_fields = ['user', 'timestamp']
