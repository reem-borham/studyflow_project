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
        self.questions_url = reverse('question_list_create') # /api/posts/
        self.dashboard_url = reverse('user_dashboard')       # /api/dashboard/
        self.answers_url = reverse('answer_list_create')     # /api/answers/
        self.popular_tags_url = reverse('popular_tags')      # /api/tags/popular/

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
        # Note: Question creation also triggers a notification now, so we filter by type='answer'
        self.assertEqual(Notification.objects.filter(user=self.student, notification_type='answer').count(), 1)
        notif = Notification.objects.get(user=self.student, notification_type='answer')
        self.assertEqual(notif.notification_type, 'answer')
        self.assertIn("instructor answered your question", notif.message.lower())

    def test_question_creates_notification(self):
        self.authenticate_student()
        data = {"title": "New Q", "body": "Body", "tags": []}
        self.client.post(self.questions_url, data, format='json')
        
        # Verify the 'question posted' notification
        self.assertEqual(Notification.objects.filter(user=self.student, notification_type='question').count(), 1)

    # ==========================================
    # 3. DASHBOARD TESTS
    # ==========================================

    def test_mark_notification_read(self):
        # Create a notification for the student
        notif = Notification.objects.create(
            user=self.student,
            notification_type='answer',
            message="Test Msg"
        )
        self.authenticate_student()
        url = reverse('notification_mark_read', args=[notif.id])
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

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
        self.assertEqual(stats['questions_asked'], 2)
        self.assertEqual(stats['questions_answered'], 1)
        
        # Verify new fields (lists and profile info)
        self.assertIn('questions', response.data)
        self.assertIn('answers', response.data)
        self.assertEqual(len(response.data['questions']), 2)
        self.assertEqual(len(response.data['answers']), 1)
        self.assertIn('profile_picture', response.data) # Can be None, but key must be there

    # ==========================================
    # 4. TAGS TESTS
    # ==========================================
    def test_popular_tags(self):
        # Create some tags with different usage counts
        Tag.objects.create(name="python", usage_count=10)
        Tag.objects.create(name="django", usage_count=5)
        Tag.objects.create(name="api", usage_count=1)
        
        response = self.client.get(self.popular_tags_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return top tags
        self.assertEqual(len(response.data), 3)
        self.assertEqual(response.data[0]['name'], "python")
