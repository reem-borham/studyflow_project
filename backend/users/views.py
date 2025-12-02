from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt 
import json
from .models import user


@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            email = data.get("email")
            password = data.get("password")  # plain password
            if not email or not password:
                return JsonResponse({"success": False, "error": "Email and password are required"}, status=400)

            # Lookup user by email
            try:
                user = user.objects.get(email=email)
            except user.DoesNotExist:
                return JsonResponse({"success": False, "error": "User not found"}, status=404)

            # Compare with stored password_hash
            # (since your db.sql stores "password_hash")
            if user.password_hash != password:
                return JsonResponse({"success": False, "error": "Invalid password"}, status=401)

            return JsonResponse({
                "success": True,
                "message": "Login successful",
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
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
            password = data.get("password")  # plain password or hash it yourself
            role = data.get("role", "user")

            if not username or not email or not password:
                return JsonResponse({"success": False, "error": "Missing fields"}, status=400)

            user = user.objects.create(
                username=username,
                email=email,
                password_hash=password,
                role=role
            )

            return JsonResponse({
                "success": True,
                "message": "Account created successfully",
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            })

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"error": "Use POST method"}, status=400)
