from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_banned', 'registration_date', 'is_staff')
    search_fields = ('username', 'email')
    list_filter = ('role', 'is_banned', 'is_staff', 'is_active')
    readonly_fields = ('registration_date', 'last_login', 'date_joined')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('username', 'email', 'role')
        }),
        ('Profile', {
            'fields': ('bio', 'profile_picture')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_banned')
        }),
        ('Important dates', {
            'fields': ('registration_date', 'last_login', 'date_joined')
        }),
    )
