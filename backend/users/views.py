from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt 
import json
from .models import User

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            # Get data from Next.js
            data = json.loads(request.body)
            
            # Get user_type from data (default to 'student')
            user_type = data.get('user_type', 'student')
            
            # Check if user_type is valid
            if user_type not in ['student', 'instructor']:
                return JsonResponse({
                    'success': False,
                    'error': 'user_type must be "student" or "instructor"'
                }, status=400)
            
            # Create user based on type
            if user_type == 'student':
                user = Student.objects.create(
                    name=data['name'],
                    email=data['email'],
                    password=data['password']
                )
                message = 'Student created successfully!'
            else:  # instructor
                user = Instructor.objects.create(
                    name=data['name'],
                    email=data['email'],
                    password=data['password']
                )
                message = 'Instructor created successfully!'
            
            # Send response back
            return JsonResponse({
                'success': True,
                'message': message,
                'user_type': user_type,
                'user_id': user.id,
                'name': user.name,
                'email': user.email
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    
    return JsonResponse({
        'error': 'Use POST method'
    }, status=400)