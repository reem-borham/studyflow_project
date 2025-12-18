import os
import django
import sys

# Setup Django environment
sys.path.append('c:\\Users\\sarah\\Desktop\\StudyFlow\\studyflow_project\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studyflow.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

def verify_authentication():
    client = APIClient()
    print("Starting Authentication Verification...\n")
    
    # Clean up existing test users if they exist
    User.objects.filter(username='test_student').delete()
    User.objects.filter(username='test_instructor').delete()
    
    # Helper to check response
    def check_response(response, success_msg):
        try:
            if str(response.status_code).startswith('2'):
                print(f"   [PASS] {success_msg}")
                if 'token' in response.data:
                    print("   [PASS] Token received.")
                return True
            else:
                print(f"   [FAIL] Expected success, got {response.status_code}")
                try:
                    print(f"   Error: {response.data}")
                except:
                    print(f"   Error Content: {response.content[:200]}...")
                    with open('error.html', 'wb') as f:
                        f.write(response.content)
                    print("   Saved error details to error.html")
                return False
        except AttributeError:
            print(f"   [ERROR] Response has no .data attribute. Status: {response.status_code}")
            with open('error.html', 'wb') as f:
                f.write(response.content)
            print("   Saved error details to error.html")
            return False

    # 1. Test Registration (Student)
    print("1. Testing Registration (Student)...")
    student_data = {
        'username': 'test_student',
        'email': 'student@example.com',
        'password': 'password123',
        'role': 'student',
        'bio': 'I am a student'
    }
    response = client.post('/api/register/', student_data)
    check_response(response, "Student registered successfully.")

    # 2. Test Registration (Instructor)
    print("\n2. Testing Registration (Instructor)...")
    instructor_data = {
        'username': 'test_instructor',
        'email': 'instructor@example.com',
        'password': 'password123',
        'role': 'instructor',
        'bio': 'I am an instructor'
    }
    response = client.post('/api/register/', instructor_data)
    check_response(response, "Instructor registered successfully.")

    # 3. Test Login
    print("\n3. Testing Login...")
    login_data = {
        'username': 'test_student',
        'password': 'password123'
    }
    response = client.post('/api/login/', login_data)
    check_response(response, "Login successful.")

    # 4. Test Login with Email
    print("\n4. Testing Login with Email...")
    login_data_email = {
        'email': 'student@example.com',
        'password': 'password123'
    }
    response = client.post('/api/login/', login_data_email)
    check_response(response, "Email Login successful.")
        
    print("\nVerification Complete.")

if __name__ == "__main__":
    verify_authentication()
