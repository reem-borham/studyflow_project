from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register') # Ensure 'register' matches the name in urls.py
        self.login_url = reverse('login')       # Ensure 'login' matches the name in urls.py
        
        # Pre-create a user for login tests
        self.user = User.objects.create_user(
            username='existing_user',
            email='existing@example.com',
            password='password123',
            role='student'
        )

    def test_student_registration_success(self):
        data = {
            'username': 'test_student',
            'email': 'student@example.com',
            'password': 'password123',
            'role': 'student',
            'bio': 'I am a student'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(User.objects.count(), 2) # 1 existing + 1 new

    def test_instructor_registration_success(self):
        data = {
            'username': 'test_instructor',
            'email': 'instructor@example.com',
            'password': 'password123',
            'role': 'instructor',
            'bio': 'I am an instructor'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_registration_duplicate_email(self):
        data = {
            'username': 'duplicate_user',
            'email': 'existing@example.com', # Duplicate email
            'password': 'password123',
            'role': 'student'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Assuming the error message key is 'non_field_errors' or directly in the field
        # The serializer sends: serializers.ValidationError("A user with this email already exists.")
        # This usually comes as ['A user with this email already exists.'] (list of strings)
        # or {'email': [...]} if raised on a field.
        # Since we raised it in validate_email, it should be under 'email'.
        self.assertIn('email', response.data) 

    def test_login_with_username_success(self):
        data = {
            'username': 'existing_user',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_with_email_success(self):
        data = {
            'email': 'existing@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_invalid_credentials(self):
        data = {
            'username': 'existing_user',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
