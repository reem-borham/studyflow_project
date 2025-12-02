# from django.contrib import admin
# from .models import Student, Instructor

# # Register Student model
# @admin.register(Student)
# class StudentAdmin(admin.ModelAdmin):
#     list_display = ('name', 'email', 'id')  
#     search_fields = ('name', 'email')      
#     list_filter = ()                       

# # Register Instructor model  
# @admin.register(Instructor)
# class InstructorAdmin(admin.ModelAdmin):
#     list_display = ('name', 'email', 'id')
#     search_fields = ('name', 'email')

# backend/users/admin.py
from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_banned', 'created_at')
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_banned')