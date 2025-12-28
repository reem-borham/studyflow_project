from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Answer
from .serializers import AnswerSerializer

class AnswerListCreateView(generics.ListCreateAPIView):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AnswerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific answer"""
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_update(self, serializer):
        # Only allow answer author to update
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only edit your own answers")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow answer author to delete
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own answers")
        instance.delete()
