from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from questions.models import Question
from answers.models import Answer
from core.models import Vote
from core.models import Tag
from questions.serializers import QuestionSerializer
from answers.serializers import AnswerSerializer

from rest_framework.parsers import MultiPartParser, FormParser

class UserAvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer # Helpful for docs

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class PopularTagsView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        tags = Tag.objects.order_by('-usage_count')[:5]
        data = [{"id": tag.id, "name": tag.name, "count": tag.usage_count} for tag in tags]
        return Response(data)

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Questions Count & Objects
        questions = Question.objects.filter(user=user).order_by('-created_at')
        questions_count = questions.count()
        questions_data = QuestionSerializer(questions, many=True).data
        
        # 2. Answers Count & Objects
        answers = Answer.objects.filter(user=user).order_by('-created_at')
        answers_count = answers.count()
        answers_data = AnswerSerializer(answers, many=True).data
        
        # 3. Total Reputations (Upvotes - Downvotes)
        # We need to sum votes on the user's Questions AND Answers
        
        # Helper to calculate net votes for a specific model type
        def get_votes_for_model(model_class, user):
            ct = ContentType.objects.get_for_model(model_class)
            # Find IDs of objects owned by user
            object_ids = model_class.objects.filter(user=user).values_list('id', flat=True)
            
            upvotes = Vote.objects.filter(
                content_type=ct, 
                object_id__in=object_ids, 
                vote_type='up'
            ).count()
            
            downvotes = Vote.objects.filter(
                content_type=ct, 
                object_id__in=object_ids, 
                vote_type='down'
            ).count()
            
            return upvotes - downvotes

        question_reputation = get_votes_for_model(Question, user)
        answer_reputation = get_votes_for_model(Answer, user)
        
        total_reputation = question_reputation + answer_reputation

        return Response({
            "username": user.username,
            "profile_picture": user.profile_picture.url if user.profile_picture else None,
            "email": user.email, # Added email as requested
            "questions": questions_data, # Added questions list
            "answers": answers_data,     # Added answers list
            "stats": {
                "questions_asked": questions_count,
                "questions_answered": answers_count,
                "reputation_score": total_reputation,
                "breakdown": {
                    "question_votes": question_reputation,
                    "answer_votes": answer_reputation
                }
            }
        })