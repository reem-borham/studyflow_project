from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# =====================================================
# TAGS TABLE
# =====================================================
class Tag(models.Model):
    """
    PK: id

    Used to categorize questions
    """

    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    usage_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


# =====================================================
# QUESTIONS TABLE
# =====================================================
class Question(models.Model):
    """
    PK: id

    Relationships:
    - FK user → User (Many-to-One)
    - M2M tags → Tag (Many-to-Many)
    """

    title = models.CharField(max_length=255)
    body = models.TextField()

    # FK → User (question author)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')

    # M2M → Tag
    tags = models.ManyToManyField(Tag, related_name='questions')

    creation_date = models.DateTimeField(default=timezone.now)
    views = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


# =====================================================
# ANSWERS TABLE
# =====================================================
class Answer(models.Model):
    """
    PK: id

    Relationships:
    - FK question → Question (Many-to-One)
    - FK user → User (Many-to-One)
    """

    # FK → Question
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')

    body = models.TextField()

    # FK → User (answer author)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')

    votes = models.IntegerField(default=0)

    # Marked by Instructor
    is_best_answer = models.BooleanField(default=False)

    creation_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Answer to {self.question.title}"


# =====================================================
# COMMENTS TABLE
# =====================================================
class Comment(models.Model):
    """
    PK: id

    Relationships:
    - FK user → User
    - FK parent_question → Question (optional)
    - FK parent_answer → Answer (optional)

    A comment belongs to EITHER a question OR an answer
    """

    # FK → Question (nullable)
    parent_question = models.ForeignKey(
        Question, on_delete=models.CASCADE, null=True, blank=True, related_name='comments'
    )

    # FK → Answer (nullable)
    parent_answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, null=True, blank=True, related_name='comments'
    )

    content = models.TextField()

    # FK → User
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')

    creation_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Comment by {self.user.username}"


# =====================================================
# VOTES TABLE
# =====================================================
class Vote(models.Model):
    """
    PK: id

    Relationships:
    - FK user → User
    - FK question → Question (optional)
    - FK answer → Answer (optional)

    Constraint:
    - One vote per user per content
    """

    VOTE_TYPE_CHOICES = [
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    ]

    # FK → User
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')

    # FK → Question (nullable)
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, null=True, blank=True, related_name='votes'
    )

    # FK → Answer (nullable)
    answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, null=True, blank=True, related_name='votes'
    )

    vote_type = models.CharField(max_length=10, choices=VOTE_TYPE_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        # Prevent duplicate voting
        unique_together = ('user', 'question', 'answer')

    def __str__(self):
        return f"{self.vote_type} by {self.user.username}"


# =====================================================
# REPORTS TABLE
# =====================================================
class Report(models.Model):
    """
    PK: id

    Relationships:
    - FK reporter → User
    - FK question → Question (optional)
    - FK answer → Answer (optional)
    - FK comment → Comment (optional)
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
    ]

    # FK → User (report creator)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')

    # Reported content (only one should be set)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, blank=True)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)

    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Report by {self.reporter.username}"


# =====================================================
# NOTIFICATIONS TABLE
# =====================================================
class Notification(models.Model):
    """
    PK: id

    Relationships:
    - FK user → User

    reference_id links to related content (Question / Answer / User)
    """

    NOTIFICATION_TYPE_CHOICES = [
        ('reply', 'Reply'),
        ('like', 'Like'),
        ('follow', 'Follow'),
        ('best_answer', 'Best Answer'),
    ]

    # FK → User (notification receiver)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')

    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    reference_id = models.PositiveIntegerField()

    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.notification_type} notification"
