from rest_framework import generics, permissions
from .models import Answer
from .serializers import AnswerSerializer
from users.models import User

class AnswerListCreateView(generics.ListCreateAPIView):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Get username from request data
        username = self.request.data.get('username')
        
        if username:
            try:
                user = User.objects.get(username=username)
                serializer.save(user=user)
                return
            except User.DoesNotExist:
                pass
        
        # Fallback to first user
        user = User.objects.first()
        if user:
            serializer.save(user=user)
        else:
            serializer.save()
