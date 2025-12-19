import os
import django
import sys
from django.db.models import Count

# Setup Django environment
sys.path.append('c:\\Users\\sarah\\Desktop\\StudyFlow\\studyflow_project\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studyflow.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def clean_duplicates():
    print("Checking for duplicate emails...")
    duplicates = User.objects.values('email').annotate(email_count=Count('email')).filter(email_count__gt=1)
    
    if not duplicates:
        print("No duplicate emails found.")
        return

    for entry in duplicates:
        email = entry['email']
        if not email: # Skip empty emails if allowed
            continue
            
        print(f"Found duplicate email: {email}")
        users = User.objects.filter(email=email).order_by('date_joined')
        # Keep the first one (oldest), delete the rest
        users_to_keep = users.first()
        users_to_delete = users.exclude(id=users_to_keep.id)
        
        count = users_to_delete.count()
        users_to_delete.delete()
        print(f"Deleted {count} duplicate user(s) for email '{email}'. Kept user '{users_to_keep.username}'.")

if __name__ == "__main__":
    clean_duplicates()
