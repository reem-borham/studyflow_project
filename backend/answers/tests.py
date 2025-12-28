from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from questions.models import Question
from answers.models import Answer

User = get_user_model()

class AnswerEditDeleteTestCase(TestCase):
    """Test cases for Answer Edit and Delete functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(
            username='user_a',
            email='usera@example.com',
            password='pass123'
        )
        self.user_b = User.objects.create_user(
            username='user_b',
            email='userb@example.com',
            password='pass123'
        )
        self.question = Question.objects.create(
            title='Test Question',
            body='Test body',
            user=self.user_a
        )
        self.answer = Answer.objects.create(
            question=self.question,
            body='Original answer',
            user=self.user_a
        )
    
    def test_answer_owner_can_edit(self):
        """Test that answer owner can edit their answer"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.patch(f'/api/answers/{self.answer.id}/', {
            'body': 'Updated answer'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.answer.refresh_from_db()
        self.assertEqual(self.answer.body, 'Updated answer')
    
    def test_non_owner_cannot_edit_answer(self):
        """Test that non-owner cannot edit someone else's answer"""
        self.client.force_authenticate(user=self.user_b)
        response = self.client.patch(f'/api/answers/{self.answer.id}/', {
            'body': 'Hacked answer'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_cannot_edit_answer(self):
        """Test that unauthenticated users cannot edit answers"""
        response = self.client.patch(f'/api/answers/{self.answer.id}/', {
            'body': 'Hacked answer'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_answer_owner_can_delete(self):
        """Test that answer owner can delete their answer"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.delete(f'/api/answers/{self.answer.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Answer.objects.filter(id=self.answer.id).exists())
    
    def test_non_owner_cannot_delete_answer(self):
        """Test that non-owner cannot delete someone else's answer"""
        self.client.force_authenticate(user=self.user_b)
        response = self.client.delete(f'/api/answers/{self.answer.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Answer.objects.filter(id=self.answer.id).exists())
    
    def test_unauthenticated_cannot_delete_answer(self):
        """Test that unauthenticated users cannot delete answers"""
        response = self.client.delete(f'/api/answers/{self.answer.id}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class InstructorBestAnswerTestCase(TestCase):
    """Test cases for Instructor marking best answer"""
    
    def setUp(self):
        self.client = APIClient()
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='pass123',
            role='instructor'
        )
        self.student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='pass123',
            role='student'
        )
        self.question_author = User.objects.create_user(
            username='author',
            email='author@example.com',
            password='pass123',
            role='student'
        )
        self.question = Question.objects.create(
            title='Test Question',
            body='Test body',
            user=self.question_author
        )
        self.answer = Answer.objects.create(
            question=self.question,
            body='Test answer',
            user=self.student
        )
    
    def test_instructor_can_mark_best_answer(self):
        """Test that instructor can mark best answer"""
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post(f'/api/answers/{self.answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['marked_by'], 'instructor')
        self.answer.refresh_from_db()
        self.assertTrue(self.answer.is_best_answer)
    
    def test_question_author_can_mark_best_answer(self):
        """Test that question author can mark best answer"""
        self.client.force_authenticate(user=self.question_author)
        response = self.client.post(f'/api/answers/{self.answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['marked_by'], 'author')
    
    def test_regular_student_cannot_mark_best_answer(self):
        """Test that regular student cannot mark best answer"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/answers/{self.answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class LogoutTestCase(TestCase):
    """Test cases for Logout functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_logout_success(self):
        """Test that authenticated user can logout"""
        self.client.force_authenticate(user=self.user)
        from rest_framework.authtoken.models import Token
        token = Token.objects.create(user=self.user)
        
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Successfully logged out')
        self.assertFalse(Token.objects.filter(user=self.user).exists())
    
    def test_logout_unauthenticated(self):
        """Test that unauthenticated users cannot logout"""
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoleSelectionTestCase(TestCase):
    """Test that users can select their role during registration"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_register_as_student(self):
        """Test registering with student role"""
        response = self.client.post('/api/register/', {
            'username': 'student1',
            'email': 'student1@example.com',
            'password': 'SecurePass123!',
            'role': 'student'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='student1')
        self.assertEqual(user.role, 'student')
    
    def test_register_as_instructor(self):
        """Test registering with instructor role"""
        response = self.client.post('/api/register/', {
            'username': 'instructor1',
            'email': 'instructor1@example.com',
            'password': 'SecurePass123!',
            'role': 'instructor'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='instructor1')
        self.assertEqual(user.role, 'instructor')
