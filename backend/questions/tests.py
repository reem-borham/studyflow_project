from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from questions.models import Question

User = get_user_model()

class InstructorPermissionsTestCase(TestCase):
    """Test cases to verify instructor permissions and restrictions"""
    
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
        self.question = Question.objects.create(
            title='Student Question',
            body='Asked by student',
            user=self.student
        )
    
    # ========== QUESTION RESTRICTIONS ==========
    
    def test_instructor_cannot_create_question(self):
        """Test that instructors CANNOT create questions"""
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post('/api/posts/', {
            'title': 'Instructor Question',
            'body': 'This should fail'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Instructors cannot create questions', response.data['detail'])
    
    def test_student_can_create_question(self):
        """Test that students CAN create questions"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/posts/', {
            'title': 'Student Question',
            'body': 'This should work'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    # ========== INSTRUCTOR CAN DO THESE ==========
    
    def test_instructor_can_post_answer(self):
        """Test that instructors CAN post answers"""
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post('/api/answers/', {
            'body': 'Instructor answer',
            'question': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_instructor_can_post_comment(self):
        """Test that instructors CAN post comments"""
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post('/api/comments/', {
            'content': 'Instructor comment',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_instructor_can_vote(self):
        """Test that instructors CAN vote"""
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_instructor_can_report_content(self):
        """Test that instructors CAN report content"""
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post('/api/reports/', {
            'report_type': 'spam',
            'description': 'Inappropriate content',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_instructor_can_mark_best_answer(self):
        """Test that instructors CAN mark best answers"""
        from answers.models import Answer
        answer = Answer.objects.create(
            question=self.question,
            body='Test answer',
            user=self.student
        )
        self.client.force_authenticate(user=self.instructor)
        response = self.client.post(f'/api/answers/{answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['marked_by'], 'instructor')


class StudentPermissionsTestCase(TestCase):
    """Test that students have all normal permissions"""
    
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='pass123',
            role='student'
        )
    
    def test_student_can_create_question(self):
        """Test that students CAN create questions"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/posts/', {
            'title': 'My Question',
            'body': 'Question body'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_student_can_post_answer(self):
        """Test that students CAN post answers"""
        question = Question.objects.create(
            title='Test',
            body='Test',
            user=self.student
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/answers/', {
            'body': 'My answer',
            'question': question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_student_can_vote(self):
        """Test that students CAN vote"""
        question = Question.objects.create(
            title='Test',
            body='Test',
            user=self.student
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
