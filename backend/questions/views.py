from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Question
from .serializers import QuestionSerializer

class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Instructors cannot create questions - only students
        if self.request.user.role == 'instructor':
            raise PermissionDenied("Instructors cannot create questions. Only students can ask questions.")
        serializer.save(user=self.request.user)

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Optional: Optimize by prefetching tags
        return Question.objects.all().prefetch_related('tags')
    
    def perform_update(self, serializer):
        # Only allow question owner to update
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only edit your own questions")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow question owner to delete
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own questions")
        instance.delete()
