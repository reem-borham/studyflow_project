from django.db.models.signals import post_save
from django.dispatch import receiver
from answers.models import Answer
from core.models import Notification
from questions.models import Question

@receiver(post_save, sender=Answer)
def notify_question_author(sender, instance, created, **kwargs):
    """
    Observer: Listens for new Answers (Subject).
    Action: Notifies the Question author.
    """
    if created:
        question = instance.question
        answer_author = instance.user
        question_author = question.user

        # Don't notify if you answer your own question
        if answer_author != question_author:
            Notification.objects.create(
                user=question_author,
                notification_type='answer',
                message=f"{answer_author.username} answered your question: {question.title[:30]}...",
                actor=answer_author,
                content_object=instance # Link to the specific answer
            )

@receiver(post_save, sender=Question)
def notify_question_created(sender, instance, created, **kwargs):
    """
    Action: Notifies the author that their question was posted successfully.
    """
    if created:
        Notification.objects.create(
            user=instance.user,
            notification_type='question',
            message=f"Your question '{instance.title[:30]}...' was posted successfully!",
            content_object=instance
        )
