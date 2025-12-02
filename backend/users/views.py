# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt 
# import json
# from .models import user


# @csrf_exempt
# def login(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)

#             email = data.get("email")
#             password = data.get("password")  # plain password
#             if not email or not password:
#                 return JsonResponse({"success": False, "error": "Email and password are required"}, status=400)

#             # Lookup user by email
#             try:
#                 user = user.objects.get(email=email)
#             except user.DoesNotExist:
#                 return JsonResponse({"success": False, "error": "User not found"}, status=404)

#             # Compare with stored password_hash
#             # (since your db.sql stores "password_hash")
#             if user.password_hash != password:
#                 return JsonResponse({"success": False, "error": "Invalid password"}, status=401)

#             return JsonResponse({
#                 "success": True,
#                 "message": "Login successful",
#                 "user_id": user.id,
#                 "username": user.username,
#                 "email": user.email,
#                 "role": user.role,
#             })

#         except Exception as e:
#             return JsonResponse({"success": False, "error": str(e)}, status=400)

#     return JsonResponse({"error": "Use POST method"}, status=400)

# @csrf_exempt
# def signup(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)

#             username = data.get("username")
#             email = data.get("email")
#             password = data.get("password") 
#             role = data.get("role", "user")

#             if not username or not email or not password:
#                 return JsonResponse({"success": False, "error": "Missing fields"}, status=400)

#             user = user.objects.create(
#                 username=username,
#                 email=email,
#                 password_hash=password,
#                 role=role
#             )

#             return JsonResponse({
#                 "success": True,
#                 "message": "Account created successfully",
#                 "user_id": user.id,
#                 "username": user.username,
#                 "email": user.email,
#                 "role": user.role,
#             })

#         except Exception as e:
#             return JsonResponse({"success": False, "error": str(e)}, status=400)

#     return JsonResponse({"error": "Use POST method"}, status=400)

# backend/users/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt 
import json
from .models import User  # Capital U - class name

@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            email = data.get("email")
            password = data.get("password")
            
            if not email or not password:
                return JsonResponse({"success": False, "error": "Email and password are required"}, status=400)

            # Lookup user by email
            try:
                user_obj = User.objects.get(email=email)  # Different variable name
            except User.DoesNotExist:
                return JsonResponse({"success": False, "error": "User not found"}, status=404)

            # Compare with stored password_hash
            if user_obj.password_hash != password:
                return JsonResponse({"success": False, "error": "Invalid password"}, status=401)

            return JsonResponse({
                "success": True,
                "message": "Login successful",
                "user_id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
                "role": user_obj.role,
                "bio": user_obj.bio,
                "is_banned": user_obj.is_banned
            })

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"error": "Use POST method"}, status=400)

@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            username = data.get("username")
            email = data.get("email")
            password = data.get("password") 
            role = data.get("role", "user")
            bio = data.get("bio", "")

            if not username or not email or not password:
                return JsonResponse({"success": False, "error": "Missing fields"}, status=400)

            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({"success": False, "error": "Email already exists"}, status=400)
            if User.objects.filter(username=username).exists():
                return JsonResponse({"success": False, "error": "Username already exists"}, status=400)

            user_obj = User.objects.create(
                username=username,
                email=email,
                password_hash=password,  # Note: Using password_hash field
                role=role,
                bio=bio
            )

            return JsonResponse({
                "success": True,
                "message": "Account created successfully",
                "user_id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
                "role": user_obj.role,
                "bio": user_obj.bio
            })

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"error": "Use POST method"}, status=400)