# Run this in Django shell to change user role
from users.models import User

username = 'potatoes'  # Change this to your username

try:
    user = User.objects.get(username=username)
    print(f"Current role: {user.role}")
    user.role = 'instructor'
    user.save()
    print(f"✅ Changed {username} to instructor!")
except User.DoesNotExist:
    print(f"User {username} not found!")
    print("Available users:")
    for u in User.objects.all():
        print(f"  {u.username} - {u.role}")
