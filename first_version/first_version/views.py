from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import HttpResponse

def login_page(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')   # redirect to home after login
        else:
            messages.error(request, 'Invalid username or password')

    return render(request, 'login.html')


def home(request):
    return HttpResponse("Welcome! You are logged in.")
