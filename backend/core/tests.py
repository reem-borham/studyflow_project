from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from questions.models import Question
from answers.models import Answer
from core.models import Vote, Comment, Report, Tag
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class VotingAPITestCase(TestCase):
    """Test cases for Voting API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        self.question = Question.objects.create(
            title='Test Question',
            body='Test body',
            user=self.user2
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_upvote(self):
        """Test creating an upvote on a question"""
        response = self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['action'], 'created')
        self.assertEqual(Vote.objects.count(), 1)
    
    def test_create_downvote(self):
        """Test creating a downvote"""
        response = self.client.post('/api/votes/', {
            'vote_type': 'down',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vote.objects.first().vote_type, 'down')
    
    def test_toggle_vote(self):
        """Test removing vote by clicking same button"""
        # First vote
        self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question.id
        })
        # Click same button again
        response = self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'removed')
        self.assertEqual(Vote.objects.count(), 0)
    
    def test_change_vote(self):
        """Test changing vote from up to down"""
        # First upvote
        self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question.id
        })
        # Change to downvote
        response = self.client.post('/api/votes/', {
            'vote_type': 'down',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'changed')
        self.assertEqual(Vote.objects.first().vote_type, 'down')
    
    def test_vote_requires_authentication(self):
        """Test that voting requires authentication"""
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/votes/', {
            'vote_type': 'up',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_votes(self):
        """Test listing votes for an object"""
        Vote.objects.create(
            user=self.user,
            vote_type='up',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        response = self.client.get(f'/api/votes/list/?content_type=question&object_id={self.question.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class CommentAPITestCase(TestCase):
    """Test cases for Comment API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.question = Question.objects.create(
            title='Test Question',
            body='Test body',
            user=self.user
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_comment(self):
        """Test creating a comment"""
        response = self.client.post('/api/comments/', {
            'content': 'This is a test comment',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
    
    def test_create_reply_comment(self):
        """Test creating a reply to a comment"""
        # Create parent comment
        parent = Comment.objects.create(
            user=self.user,
            content='Parent comment',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        # Create reply
        response = self.client.post('/api/comments/', {
            'content': 'Reply comment',
            'content_type': 'question',
            'object_id': self.question.id,
            'parent_comment': parent.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)
    
    def test_list_comments(self):
        """Test listing comments for an object"""
        Comment.objects.create(
            user=self.user,
            content='Test comment',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        response = self.client.get(f'/api/comments/?content_type=question&object_id={self.question.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_update_own_comment(self):
        """Test updating own comment"""
        comment = Comment.objects.create(
            user=self.user,
            content='Original content',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        response = self.client.patch(f'/api/comments/{comment.id}/', {
            'content': 'Updated content'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.content, 'Updated content')
        self.assertTrue(comment.is_edited)
    
    def test_delete_own_comment(self):
        """Test deleting own comment"""
        comment = Comment.objects.create(
            user=self.user,
            content='Test comment',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        response = self.client.delete(f'/api/comments/{comment.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)


class BestAnswerAPITestCase(TestCase):
    """Test cases for Best Answer marking"""
    
    def setUp(self):
        self.client = APIClient()
        self.question_author = User.objects.create_user(
            username='author',
            email='author@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='testpass123'
        )
        self.question = Question.objects.create(
            title='Test Question',
            body='Test body',
            user=self.question_author
        )
        self.answer = Answer.objects.create(
            question=self.question,
            body='Test answer',
            user=self.other_user
        )
    
    def test_mark_best_answer_as_author(self):
        """Test that question author can mark best answer"""
        self.client.force_authenticate(user=self.question_author)
        response = self.client.post(f'/api/answers/{self.answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.answer.refresh_from_db()
        self.assertTrue(self.answer.is_best_answer)
    
    def test_mark_best_answer_as_non_author(self):
        """Test that non-author cannot mark best answer"""
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/answers/{self.answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_mark_best_answer_unauthenticated(self):
        """Test that unauthenticated users cannot mark best answer"""
        response = self.client.post(f'/api/answers/{self.answer.id}/mark-best/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReportAPITestCase(TestCase):
    """Test cases for Reporting API"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True,
            is_superuser=True
        )
        self.question = Question.objects.create(
            title='Test Question',
            body='Test body',
            user=self.user
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_report(self):
        """Test creating a report"""
        response = self.client.post('/api/reports/', {
            'report_type': 'spam',
            'description': 'This is spam content',
            'content_type': 'question',
            'object_id': self.question.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.count(), 1)
    
    def test_list_reports_as_admin(self):
        """Test that admin can list reports"""
        Report.objects.create(
            reporter=self.user,
            report_type='spam',
            description='Test report',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/reports/list/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_list_reports_as_non_admin(self):
        """Test that non-admin cannot list reports"""
        response = self.client.get('/api/reports/list/')
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)
    
    def test_resolve_report_as_admin(self):
        """Test that admin can resolve reports"""
        report = Report.objects.create(
            reporter=self.user,
            report_type='spam',
            description='Test report',
            content_type=ContentType.objects.get_for_model(Question),
            object_id=self.question.id
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/reports/{report.id}/resolve/', {
            'status': 'resolved',
            'admin_notes': 'Not spam'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, 'resolved')


class TagAPITestCase(TestCase):
    """Test cases for Tag API"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_list_tags(self):
        """Test listing all tags"""
        Tag.objects.create(name='python', usage_count=10)
        Tag.objects.create(name='django', usage_count=5)
        response = self.client.get('/api/tags/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Should be ordered by usage_count descending
        self.assertEqual(response.data[0]['name'], 'python')
    
    def test_create_tag(self):
        """Test creating a tag"""
        response = self.client.post('/api/tags/', {
            'name': 'javascript',
            'description': 'JavaScript programming language'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tag.objects.count(), 1)
    
    def test_get_tag_detail(self):
        """Test getting tag details"""
        tag = Tag.objects.create(name='python', usage_count=10)
        response = self.client.get(f'/api/tags/{tag.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'python')
