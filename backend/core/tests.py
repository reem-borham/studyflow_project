from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from questions.models import Question
from answers.models import Answer
from core.models import Notification, Tag

User = get_user_model()

class StudyFlowTests(APITestCase):
    def setUp(self):
        # Create Users
        self.student = User.objects.create_user(username='student', password='password123', email='student@test.com')
        self.instructor = User.objects.create_user(username='instructor', password='password123', email='instructor@test.com')
        
        # URLs
        self.questions_url = reverse('question_list_create') # /api/questions/
        self.dashboard_url = reverse('user_dashboard')       # /api/dashboard/
        self.answers_url = reverse('answer_list_create')     # /api/answers/

    def authenticate_student(self):
        self.client.force_authenticate(user=self.student)

    def authenticate_instructor(self):
        self.client.force_authenticate(user=self.instructor)

    # ==========================================
    # 1. QUESTIONS TESTS (Create, Update, Delete)
    # ==========================================
    def test_create_question_with_tags(self):
        self.authenticate_student()
        data = {
            "title": "How to use Django testing?",
            "body": "I need help with APITestCase.",
            "tags": ["django", "testing"]
        }
        response = self.client.post(self.questions_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Question.objects.count(), 1)
        self.assertEqual(Question.objects.get().tags.count(), 2)
        self.assertTrue(Tag.objects.filter(name="django").exists())

    def test_update_question(self):
        self.authenticate_student()
        # First create a question
        question = Question.objects.create(user=self.student, title="Original", body="Original body")
        question.tags.add(Tag.objects.create(name="old"))
        
        url = reverse('question_detail', args=[question.id])
        data = {
            "title": "Updated Title",
            "body": "Updated Body",
            "tags": ["new", "tags"]
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Updated Title")
        # Check tags updated
        self.assertEqual(len(response.data['tag_names']), 2)
        self.assertIn("new", response.data['tag_names'])

    def test_delete_question(self):
        self.authenticate_student()
        question = Question.objects.create(user=self.student, title="Delete Me", body="...")
        url = reverse('question_detail', args=[question.id])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Question.objects.count(), 0)

    # ==========================================
    # 2. ANSWERS & NOTIFICATIONS TESTS
    # ==========================================
    def test_answer_creates_notification(self):
        # Student asks a question
        question = Question.objects.create(user=self.student, title="Help!", body="...")
        
        # Instructor answers it
        self.authenticate_instructor()
        data = {
            "body": "Here is the solution.",
            "question": question.id
        }
        response = self.client.post(self.answers_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # VERIFY NOTIFICATION (Signal check)
        # Student should have received a notification
        self.assertEqual(Notification.objects.filter(user=self.student).count(), 1)
        notif = Notification.objects.get(user=self.student)
        self.assertEqual(notif.notification_type, 'answer')
        self.assertIn("instructor answered your question", notif.message.lower())

    # ==========================================
    # 3. DASHBOARD TESTS
    # ==========================================
    def test_dashboard_stats(self):
        self.authenticate_student()
        
        # Setup specific stats scenario:
        # Student asks 2 questions
        q1 = Question.objects.create(user=self.student, title="Q1", body="...")
        q2 = Question.objects.create(user=self.student, title="Q2", body="...")
        
        # Student answers 1 question (from someone else)
        other_q = Question.objects.create(user=self.instructor, title="Instr Q", body="...")
        Answer.objects.create(user=self.student, question=other_q, body="My Answer")
        
        # Check Dashboard
        response = self.client.get(self.dashboard_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stats = response.data['stats']
        
        self.assertEqual(stats['questions_asked'], 2)
        self.assertEqual(stats['questions_answered'], 1)
