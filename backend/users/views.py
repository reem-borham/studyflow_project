from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt 
import json
from .models import User 
import time

# Original function-based views
@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            email = data.get("email")
            password = data.get("password")
            
            if not email or not password:
                return JsonResponse({"success": False, "error": "Email and password are required"}, status=400)

            # Lookup user by email
            try:
                user_obj = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"success": False, "error": "User not found"}, status=404)

            # Verify password using Django's check_password (for hashed passwords)
            if not user_obj.check_password(password):
                return JsonResponse({"success": False, "error": "Invalid password"}, status=401)

            return JsonResponse({
                "success": True,
                "message": "Login successful",
                "user_id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
                "role": user_obj.role,
                "bio": user_obj.bio,
            })

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"error": "Use POST method"}, status=400)


@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            username = data.get("username")
            email = data.get("email")
            password = data.get("password") 
            role = data.get("role", "user")
            bio = data.get("bio", "")

            if not username or not email or not password:
                return JsonResponse({"success": False, "error": "Missing fields"}, status=400)

            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "error": "Email already exists"}, status=400)
            if User.objects.filter(username=username).exists():
                return JsonResponse({"success": False, "error": "Username already exists"}, status=400)

            user_obj = User.objects.create_user(
                username=username,
                email=email,
                password=password,  # AbstractUser handles hashing
                role=role,
                bio=bio
            )

            return JsonResponse({
                "success": True,
                "message": "Account created successfully",
                "user_id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
                "role": user_obj.role,
                "bio": user_obj.bio
            })

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"error": "Use POST method"}, status=400)


@csrf_exempt
def test_connection(request):
    """Simple test endpoint"""
    return JsonResponse({
        "status": "connected",
        "message": "Backend is running successfully",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })


@csrf_exempt
def test_api(request):
    """Test POST endpoint"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            return JsonResponse({
                "success": True,
                "received": data,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            })
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)
    
    # For GET requests
    return JsonResponse({
        "message": "Send a POST request with JSON data to test",
        "example": {
            "username": "test",
            "email": "test@example.com"
        }
    })

def home(request):
    """Homepage showing API information"""
    return JsonResponse({
        "app": "StudyFlow Backend",
        "version": "1.0",
        "status": "running",
        "endpoints": {
            "home": "/",
            "signup": "/api/signup/ (POST)",
            "login": "/api/login/ (POST)",
            "test": "/api/test/ (GET)",
            "test_api": "/api/test-api/ (POST)",
            "admin": "/admin/"
        },
        "frontend": "http://localhost:3000",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })

# New class-based views from REST framework
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
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Questions Count
        questions_count = Question.objects.filter(user=user).count()
        
        # 2. Answers Count
        answers_count = Answer.objects.filter(user=user).count()
        
        # 3. Total Reputations (Upvotes - Downvotes)
        def get_votes_for_model(model_class, user):
            ct = ContentType.objects.get_for_model(model_class)
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
