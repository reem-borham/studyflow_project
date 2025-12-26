#!/usr/bin/env python
"""
Script to create an instructor account for testing the instructor dashboard
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studyflow.settings')
django.setup()

from users.models import User

# Create instructor account
username = 'instructor_demo'
email = 'instructor@demo.com'
password = 'instructor123'

# Check if user already exists
if User.objects.filter(username=username).exists():
    print(f"❌ User '{username}' already exists!")
    user = User.objects.get(username=username)
    print(f"Updating role to 'instructor'...")
    user.role = 'instructor'
    user.save()
    print(f"✅ Updated {username} to instructor role")
else:
    # Create new instructor user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role='instructor'
    )
    print(f"✅ Created instructor account successfully!")

print(f"\n{'='*50}")
print(f"🎓 INSTRUCTOR ACCOUNT DETAILS")
print(f"{'='*50}")
print(f"Username: {username}")
print(f"Password: {password}")
print(f"Email:    {email}")
print(f"Role:     {user.role}")
print(f"{'='*50}")
print(f"\n📝 Now you can:")
print(f"1. Go to http://localhost:5173/login")
print(f"2. Login with the credentials above")
print(f"3. You'll be redirected to the instructor dashboard!")
print(f"\n{'='*50}\n")

# Also create a student account for comparison
student_username = 'student_demo'
student_email = 'student@demo.com'
student_password = 'student123'

if not User.objects.filter(username=student_username).exists():
    student = User.objects.create_user(
        username=student_username,
        email=student_email,
        password=student_password,
        role='student'
    )
    print(f"✅ Also created a student account for comparison!")
    print(f"\n{'='*50}")
    print(f"👨‍🎓 STUDENT ACCOUNT DETAILS")
    print(f"{'='*50}")
    print(f"Username: {student_username}")
    print(f"Password: {student_password}")
    print(f"Email:    {student_email}")
    print(f"Role:     {student.role}")
    print(f"{'='*50}\n")
