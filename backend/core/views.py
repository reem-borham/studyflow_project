from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.contrib.contenttypes.models import ContentType
from .models import Notification, Tag, Vote, Comment, Report
from .serializers import NotificationSerializer, TagSerializer, VoteSerializer, CommentSerializer, ReportSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.mark_as_read()
            return Response({'status': 'marked as read'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

# ==================== TAGS ====================
class TagListCreateView(generics.ListCreateAPIView):
    """List all tags or create a new tag"""
    queryset = Tag.objects.all().order_by('-usage_count')
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]

class TagDetailView(generics.RetrieveAPIView):
    """Get details of a specific tag"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]

# ==================== VOTING ====================
class VoteCreateView(APIView):
    """Cast a vote (upvote/downvote) on a question or answer"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        vote_type = request.data.get('vote_type')  # 'up' or 'down'
        content_type_name = request.data.get('content_type')  # 'question' or 'answer'
        object_id = request.data.get('object_id')
        
        if not all([vote_type, content_type_name, object_id]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        if vote_type not in ['up', 'down']:
            return Response({'error': 'Invalid vote_type. Must be "up" or "down"'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get content type
        try:
            if content_type_name == 'question':
                from questions.models import Question
                content_type = ContentType.objects.get_for_model(Question)
                obj = Question.objects.get(id=object_id)
            elif content_type_name == 'answer':
                from answers.models import Answer
                content_type = ContentType.objects.get_for_model(Answer)
                obj = Answer.objects.get(id=object_id)
            else:
                return Response({'error': 'Invalid content_type'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Object not found: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user already voted
        existing_vote = Vote.objects.filter(
            user=request.user,
            content_type=content_type,
            object_id=object_id
        ).first()
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                # Remove vote if clicking same button
                existing_vote.delete()
                return Response({'message': 'Vote removed', 'action': 'removed'}, status=status.HTTP_200_OK)
            else:
                # Change vote
                existing_vote.vote_type = vote_type
                existing_vote.save()
                return Response({'message': 'Vote changed', 'action': 'changed', 'vote_type': vote_type}, status=status.HTTP_200_OK)
        
        # Create new vote
        vote = Vote.objects.create(
            user=request.user,
            vote_type=vote_type,
            content_type=content_type,
            object_id=object_id
        )
        
        return Response({
            'message': 'Vote created',
            'action': 'created',
            'vote_type': vote_type
        }, status=status.HTTP_201_CREATED)

class VoteListView(generics.ListAPIView):
    """Get votes for a specific object"""
    serializer_class = VoteSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        content_type_name = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        
        if not content_type_name or not object_id:
            return Vote.objects.none()
        
        try:
            if content_type_name == 'question':
                from questions.models import Question
                content_type = ContentType.objects.get_for_model(Question)
            elif content_type_name == 'answer':
                from answers.models import Answer
                content_type = ContentType.objects.get_for_model(Answer)
            else:
                return Vote.objects.none()
            
            return Vote.objects.filter(content_type=content_type, object_id=object_id)
        except:
            return Vote.objects.none()

# ==================== COMMENTS ====================
class CommentListCreateView(generics.ListCreateAPIView):
    """List comments for an object or create a new comment"""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        content_type_name = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')
        
        if not content_type_name or not object_id:
            return Comment.objects.none()
        
        try:
            if content_type_name == 'question':
                from questions.models import Question
                content_type = ContentType.objects.get_for_model(Question)
            elif content_type_name == 'answer':
                from answers.models import Answer
                content_type = ContentType.objects.get_for_model(Answer)
            else:
                return Comment.objects.none()
            
            return Comment.objects.filter(
                content_type=content_type,
                object_id=object_id,
                parent_comment=None  # Only top-level comments
            ).order_by('created_at')
        except:
            return Comment.objects.none()
    
    def perform_create(self, serializer):
        content_type_name = self.request.data.get('content_type')
        object_id = self.request.data.get('object_id')
        parent_id = self.request.data.get('parent_comment')
        
        if not content_type_name or not object_id:
            raise ValueError('content_type and object_id are required')
        
        if content_type_name == 'question':
            from questions.models import Question
            content_type = ContentType.objects.get_for_model(Question)
        elif content_type_name == 'answer':
            from answers.models import Answer
            content_type = ContentType.objects.get_for_model(Answer)
        else:
            raise ValueError('Invalid content_type. Must be "question" or "answer"')
        
        parent_comment = None
        if parent_id:
            try:
                parent_comment = Comment.objects.get(id=parent_id)
            except Comment.DoesNotExist:
                raise ValueError('Parent comment not found')
        
        serializer.save(
            user=self.request.user,
            content_type=content_type,
            object_id=object_id,
            parent_comment=parent_comment
        )

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific comment"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_update(self, serializer):
        # Only allow comment owner to update
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only edit your own comments")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow comment owner to delete
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own comments")
        instance.delete()

# ==================== BEST ANSWER ====================
class MarkBestAnswerView(APIView):
    """Mark an answer as the best answer (question author OR instructor can do this)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, answer_id):
        from answers.models import Answer
        
        try:
            answer = Answer.objects.get(id=answer_id)
        except Answer.DoesNotExist:
            return Response({'error': 'Answer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is question author OR instructor
        is_question_author = answer.question.user == request.user
        is_instructor = request.user.role == 'instructor'
        
        if not (is_question_author or is_instructor):
            return Response(
                {'error': 'Only the question author or an instructor can mark best answer'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark as best answer
        answer.mark_as_best()
        
        return Response({
            'message': 'Answer marked as best',
            'answer_id': answer.id,
            'marked_by': 'instructor' if is_instructor and not is_question_author else 'author'
        }, status=status.HTTP_200_OK)

# ==================== REPORTING ====================
class ReportCreateView(generics.CreateAPIView):
    """Report inappropriate content"""
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        content_type_name = self.request.data.get('content_type')
        object_id = self.request.data.get('object_id')
        
        if content_type_name == 'question':
            from questions.models import Question
            content_type = ContentType.objects.get_for_model(Question)
        elif content_type_name == 'answer':
            from answers.models import Answer
            content_type = ContentType.objects.get_for_model(Answer)
        elif content_type_name == 'comment':
            content_type = ContentType.objects.get_for_model(Comment)
        else:
            raise ValueError('Invalid content_type')
        
        serializer.save(
            reporter=self.request.user,
            content_type=content_type,
            object_id=object_id
        )

class ReportListView(generics.ListAPIView):
    """List reports (admin/staff only)"""
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Report.objects.all().order_by('-created_at')

class ReportResolveView(APIView):
    """Resolve a report (admin/staff only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        
        resolution_status = request.data.get('status', 'resolved')
        admin_notes = request.data.get('admin_notes', '')
        
        report.resolve(
            admin_user=request.user,
            status=resolution_status,
            notes=admin_notes
        )
        
        return Response({
            'message': 'Report resolved',
            'report_id': report.id,
            'status': resolution_status
        }, status=status.HTTP_200_OK)
