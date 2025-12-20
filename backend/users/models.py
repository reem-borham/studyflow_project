from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Custom User model for StudyFlow platform
    Uses Django's AbstractUser for better authentication
    """
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('user', 'User'),  # Keep for backwards compatibility
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    registration_date = models.DateTimeField(default=timezone.now)
    
    # Profile fields
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_banned = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username
    
    def is_student(self):
        return self.role == 'student'
    
    def is_instructor(self):
        return self.role == 'instructor'
