import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

def change_user_to_instructor(username):
    """Change a user's role from student to instructor"""
    try:
        user = User.objects.get(username=username)
        
        print(f"\nCurrent user info:")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Current Role: {user.role}")
        
        if user.role == 'instructor':
            print(f"\n✅ User '{username}' is already an instructor!")
            return
        
        # Change role to instructor
        user.role = 'instructor'
        user.save()
        
        print(f"\n✅ Successfully changed '{username}' to INSTRUCTOR!")
        print(f"  New Role: {user.role}")
        print("\n🔄 Please log out and log back in to see the changes.")
        
    except User.DoesNotExist:
        print(f"\n❌ Error: User '{username}' does not exist!")
        print("\nAvailable users:")
        for u in User.objects.all():
            print(f"  - {u.username} ({u.role})")

if __name__ == "__main__":
    print("=" * 50)
    print(" Change User Role to Instructor")
    print("=" * 50)
    
    username = input("\nEnter username to change to instructor: ").strip()
    
    if username:
        change_user_to_instructor(username)
    else:
        print("\n❌ No username provided!")
