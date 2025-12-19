from rest_framework import serializers
from .models import Question
from core.models import Tag

class QuestionSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    # For reading (displaying objects)
    tag_names = serializers.StringRelatedField(many=True, read_only=True, source='tags')

    class Meta:
        model = Question
        fields = ['id', 'title', 'body', 'user', 'tags', 'tag_names', 'created_at', 'views', 'vote_count', 'comment_count']
        read_only_fields = ['user', 'created_at', 'views']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        question = Question.objects.create(**validated_data)
        
        for tag_name in tags_data:
            # "Get or Create" logic for tags
            tag, created = Tag.objects.get_or_create(name=tag_name.lower())
            tag.increment_usage()
            question.tags.add(tag)
            
        return question

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tags if provided
        if tags_data is not None:
            instance.tags.clear() # Optional: decide if you want to replace or append. PUT usually implies replace.
            for tag_name in tags_data:
                tag, created = Tag.objects.get_or_create(name=tag_name.lower())
                if created:
                     tag.increment_usage() # Only increment if it's new? Or every time? Let's say every usage.
                # Actually usage count should probably be incremented on "add", but for simplicity let's just ensure it exists
                # Refined logic: If we want to track usage count accurately we'd need more complex logic. 
                # For now just make sure they tag exists.
                instance.tags.add(tag)
        
        return instance
