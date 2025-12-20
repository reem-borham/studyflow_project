from rest_framework import generics, permissions
from .models import Question
from .serializers import QuestionSerializer

class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Get username from request data
        from users.models import User
        username = self.request.data.get('username')
        
        if username:
            try:
                user = User.objects.get(username=username)
                serializer.save(user=user)
                return
            except User.DoesNotExist:
                pass
        
        # Fallback to first user if no username provided
        user = User.objects.first()
        if user:
            serializer.save(user=user)
        else:
            serializer.save()

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Question.objects.all().prefetch_related('tags')
