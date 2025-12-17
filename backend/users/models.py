from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
class User(AbstractUser):
    """
    Custom User model for StudyFlow platform
    Only two roles needed for platform users:
    - Student (default)
    - Instructor
    """
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        # No 'administrator' - backend team uses Django admin (is_staff/is_superuser)
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    registration_date = models.DateTimeField(default=timezone.now)
    
    # Optional profile fields
    bio = models.TextField(max_length=500, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    website = models.URLField(blank=True)
    
    def __str__(self):
        return self.username
    
    def is_student(self):
        return self.role == 'student'
    
    def is_instructor(self):
        return self.role == 'instructor'
    
   