from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from questions.models import Question
from answers.models import Answer
from core.models import Comment
from django.contrib.contenttypes.models import ContentType
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
import io

User = get_user_model()

class AuthenticationAPITestCase(TestCase):
    """Test cases for Registration and Login API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_register_new_user(self):
        """Test registering a new user via API"""
        response = self.client.post('/api/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'role': 'student'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())
    
    def test_register_duplicate_username(self):
        """Test that registering with duplicate username fails"""
        User.objects.create_user(username='existing', email='existing@example.com', password='pass123')
        response = self.client.post('/api/register/', {
            'username': 'existing',
            'email': 'newemail@example.com',
            'password': 'SecurePass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_duplicate_email(self):
        """Test that registering with duplicate email fails"""
        User.objects.create_user(username='user1', email='same@example.com', password='pass123')
        response = self.client.post('/api/register/', {
            'username': 'user2',
            'email': 'same@example.com',
            'password': 'SecurePass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_missing_fields(self):
        """Test that registration fails with missing fields"""
        response = self.client.post('/api/register/', {
            'username': 'newuser',
            # Missing email and password
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_success(self):
        """Test successful login returns token"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!'
        )
        response = self.client.post('/api/login/', {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_login_wrong_password(self):
        """Test login fails with wrong password"""
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='CorrectPass123!'
        )
        response = self.client.post('/api/login/', {
            'email': 'test@example.com',
            'password': 'WrongPass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_nonexistent_user(self):
        """Test login fails for nonexistent user"""
        response = self.client.post('/api/login/', {
            'email': 'nonexistent@example.com',
            'password': 'SomePass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_missing_credentials(self):
        """Test login fails with missing credentials"""
        response = self.client.post('/api/login/', {
            'email': 'test@example.com'
            # Missing password
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfilePictureUploadTestCase(TestCase):
    """Test cases for Profile Picture Upload endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def create_test_image(self):
        """Create a test image file"""
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color='red')
        image.save(file, 'png')
        file.name = 'test.png'
        file.seek(0)
        return SimpleUploadedFile(
            name='test.png',
            content=file.read(),
            content_type='image/png'
        )
    
    def test_upload_profile_picture_success(self):
        """Test successful profile picture upload"""
        image = self.create_test_image()
        response = self.client.post('/api/upload-profile-image/', {
            'profile_picture': image
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.profile_picture)
    
    def test_upload_profile_picture_unauthenticated(self):
        """Test that unauthenticated users cannot upload profile pictures"""
        self.client.force_authenticate(user=None)
        image = self.create_test_image()
        response = self.client.post('/api/upload-profile-image/', {
            'profile_picture': image
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_upload_invalid_file_type(self):
        """Test that non-image files are rejected"""
        text_file = SimpleUploadedFile(
            name='test.txt',
            content=b'This is not an image',
            content_type='text/plain'
        )
        response = self.client.post('/api/upload-profile-image/', {
            'profile_picture': text_file
        }, format='multipart')
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE])


class PermissionSecurityTestCase(TestCase):
    """Negative test cases for permission and security"""
    
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
        self.question_by_a = Question.objects.create(
            title='User A Question',
            body='This is user A\'s question',
            user=self.user_a
        )
        self.answer_by_a = Answer.objects.create(
            question=self.question_by_a,
            body='User A\'s answer',
            user=self.user_a
        )
    
    # ========== QUESTION PERMISSION TESTS ==========
    
    def test_unauthenticated_cannot_create_question(self):
        """Test that unauthenticated users cannot create questions"""
        response = self.client.post('/api/posts/', {
            'title': 'New Question',
            'body': 'Question body'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_cannot_delete_other_users_question(self):
        """Test that User B cannot delete User A's question"""
        self.client.force_authenticate(user=self.user_b)
        response = self.client.delete(f'/api/posts/{self.question_by_a.id}/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
    
    def test_user_can_delete_own_question(self):
        """Test that User A can delete their own question"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.delete(f'/api/posts/{self.question_by_a.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_user_cannot_update_other_users_question(self):
        """Test that User B cannot update User A's question"""
        self.client.force_authenticate(user=self.user_b)
        response = self.client.patch(f'/api/posts/{self.question_by_a.id}/', {
            'title': 'Hacked title'
        })
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
    
    # ========== ANSWER PERMISSION TESTS ==========
    
    def test_unauthenticated_cannot_create_answer(self):
        """Test that unauthenticated users cannot create answers"""
        response = self.client.post('/api/answers/', {
            'body': 'New answer',
            'question': self.question_by_a.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_cannot_delete_other_users_answer(self):
        """Test that User B cannot delete User A's answer"""
        self.client.force_authenticate(user=self.user_b)
        response = self.client.delete(f'/api/answers/{self.answer_by_a.id}/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
    
    def test_user_can_delete_own_answer(self):
        """Test that User A can delete their own answer"""
        self.client.force_authenticate(user=self.user_a)
        answer = Answer.objects.create(
            question=self.question_by_a,
            body='Another answer',
            user=self.user_a
        )
        response = self.client.delete(f'/api/answers/{answer.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    # ========== COMMENT PERMISSION TESTS ==========
    
    def test_unauthenticated_cannot_create_comment(self):
        """Test that unauthenticated users cannot create comments"""
        response = self.client.post('/api/comments/', {
            'content': 'New comment',
            'content_type': 'question',
            'object_id': self.question_by_a.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_cannot_edit_other_users_comment(self):
        """Test that User B cannot edit User A's comment"""
        comment = Comment.objects.create(
            user=self.user_a,
            content='User A comment',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question_by_a.id
        )
        self.client.force_authenticate(user=self.user_b)
        response = self.client.patch(f'/api/comments/{comment.id}/', {
            'content': 'Hacked comment'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_user_cannot_delete_other_users_comment(self):
        """Test that User B cannot delete User A's comment"""
        comment = Comment.objects.create(
            user=self.user_a,
            content='User A comment',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question_by_a.id
        )
        self.client.force_authenticate(user=self.user_b)
        response = self.client.delete(f'/api/comments/{comment.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    # ========== BEST ANSWER PERMISSION TESTS ==========
    
    def test_non_author_cannot_mark_best_answer(self):
        """Test that non-question-author cannot mark best answer"""
        self.client.force_authenticate(user=self.user_b)
        response = self.client.post(f'/api/answers/{self.answer_by_a.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_cannot_mark_best_answer(self):
        """Test that unauthenticated users cannot mark best answer"""
        response = self.client.post(f'/api/answers/{self.answer_by_a.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ========== VOTING PERMISSION TESTS ==========
    
    def test_unauthenticated_cannot_vote(self):
        """Test that unauthenticated users cannot vote"""
        response = self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question_by_a.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ========== REPORTING TESTS ==========
    
    def test_unauthenticated_cannot_create_report(self):
        """Test that unauthenticated users cannot create reports"""
        response = self.client.post('/api/reports/', {
            'report_type': 'spam',
            'description': 'This is spam',
            'content_type': 'question',
            'object_id': self.question_by_a.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_non_admin_cannot_list_reports(self):
        """Test that non-admin users cannot list reports"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/reports/list/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_non_admin_cannot_resolve_reports(self):
        """Test that non-admin users cannot resolve reports"""
        from core.models import Report
        report = Report.objects.create(
            reporter=self.user_a,
            report_type='spam',
            description='Test',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question_by_a.id
        )
        self.client.force_authenticate(user=self.user_a)
        response = self.client.post(f'/api/reports/{report.id}/resolve/', {
            'status': 'resolved'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class XSSPreventionTestCase(TestCase):
    """Test that XSS attacks are prevented"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_question_title_xss_prevention(self):
        """Test that script tags in question titles are escaped/rejected"""
        xss_payload = '<script>alert("XSS")</script>'
        response = self.client.post('/api/posts/', {
            'title': xss_payload,
            'body': 'Normal body'
        })
        if response.status_code == status.HTTP_201_CREATED:
            question = Question.objects.get(id=response.data['id'])
            self.assertNotIn('<script>', question.title)
    
    def test_comment_xss_prevention(self):
        """Test that script tags in comments are escaped/rejected"""
        question = Question.objects.create(
            title='Test',
            body='Test',
            user=self.user
        )
        xss_payload = '<script>alert("XSS")</script>'
        response = self.client.post('/api/comments/', {
            'content': xss_payload,
            'content_type': 'question',
            'object_id': question.id
        })
        if response.status_code == status.HTTP_201_CREATED:
            comment = Comment.objects.get(id=response.data['id'])
            self.assertNotIn('<script>', comment.content)
