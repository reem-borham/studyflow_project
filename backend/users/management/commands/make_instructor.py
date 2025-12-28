from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Change a user role to instructor'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to change to instructor')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            
            self.stdout.write(f"\nCurrent user info:")
            self.stdout.write(f"  Username: {user.username}")
            self.stdout.write(f"  Email: {user.email}")
            self.stdout.write(f"  Current Role: {user.role}")
            
            if user.role == 'instructor':
                self.stdout.write(self.style.SUCCESS(f"\n✅ User '{username}' is already an instructor!"))
                return
            
            # Change role to instructor
            user.role = 'instructor'
            user.save()
            
            self.stdout.write(self.style.SUCCESS(f"\n✅ Successfully changed '{username}' to INSTRUCTOR!"))
            self.stdout.write(f"  New Role: {user.role}")
            self.stdout.write("\n🔄 Please log out and log back in to see the changes.")
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"\n❌ Error: User '{username}' does not exist!"))
            self.stdout.write("\nAvailable users:")
            for u in User.objects.all():
                self.stdout.write(f"  - {u.username} ({u.role})")
