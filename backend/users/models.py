from django.db import models

# class Student(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField()
#     password = models.CharField(max_length=100)
    
#     def __str__(self):
#         return self.name

# class Instructor(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField()
#     password = models.CharField(max_length=100)
    
#     def __str__(self):
#         return self.name

class User(models.Model):
    username = models.TextField(unique=True)
    email = models.TextField(unique=True)
    password_hash = models.TextField()
    role = models.TextField(default="user")  
    bio = models.TextField(null=True, blank=True)
    is_banned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"   
