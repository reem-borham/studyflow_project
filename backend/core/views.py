from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Notification, Tag, Vote
from .serializers import NotificationSerializer, TagSerializer, VoteSerializer
from django.contrib.contenttypes.models import ContentType
from users.models import User

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class TagListView(generics.ListCreateAPIView):
    queryset = Tag.objects.all().order_by('-usage_count')
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]

class VoteCreateView(generics.CreateAPIView):
    serializer_class = VoteSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        # Get username from request
        username = request.data.get('username')
        vote_type = request.data.get('vote_type')
        content_type_name = request.data.get('content_type')  # 'question' or 'answer'
        object_id = request.data.get('object_id')
        
        if not all([username, vote_type, content_type_name, object_id]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get content type
        try:
            if content_type_name == 'question':
                from questions.models import Question
                content_type = ContentType.objects.get_for_model(Question)
            elif content_type_name == 'answer':
                from answers.models import Answer
                content_type = ContentType.objects.get_for_model(Answer)
            else:
                return Response({'error': 'Invalid content type'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already voted
        existing_vote = Vote.objects.filter(
            user=user,
            content_type=content_type,
            object_id=object_id
        ).first()
        
        if existing_vote:
            # Update vote if changing from up to down or vice versa
            if existing_vote.vote_type != vote_type:
                existing_vote.vote_type = vote_type
                existing_vote.save()
                return Response({'message': 'Vote updated', 'vote_type': vote_type}, status=status.HTTP_200_OK)
            else:
                # Remove vote if clicking same button again
                existing_vote.delete()
                return Response({'message': 'Vote removed'}, status=status.HTTP_200_OK)
        
        # Create new vote
        vote = Vote.objects.create(
            user=user,
            vote_type=vote_type,
            content_type=content_type,
            object_id=object_id
        )
        
        return Response({
            'message': 'Vote created',
            'vote_type': vote_type
        }, status=status.HTTP_201_CREATED)
