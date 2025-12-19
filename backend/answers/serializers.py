from rest_framework import serializers
from .models import Answer

class AnswerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'body', 'user', 'username', 'question', 'created_at', 'is_best_answer', 'vote_count']
        read_only_fields = ['user', 'created_at', 'is_best_answer']
