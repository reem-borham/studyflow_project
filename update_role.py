"""
Quick script to change your account to instructor.
Run this from the backend directory:
    python update_role.py
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

# Update potatoes to instructor
try:
    user = User.objects.get(username='potatoes')
    user.role = 'instructor'
    user.save()
    print(f"✅ SUCCESS! Changed '{user.username}' to instructor")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print("\n🔄 Now logout and login to see the instructor dashboard!")
except User.DoesNotExist:
    print("❌ User 'potatoes' not found")
except Exception as e:
    print(f"❌ Error: {e}")
