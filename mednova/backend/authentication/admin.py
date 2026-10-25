from django.contrib import admin
from .models import DoctorProfile, PatientProfile, SecurityAuditLog

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('display_alias', 'email', 'created_at')
    search_fields = ('display_alias', 'email')

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'specialization', 'license_number', 'status', 'applied_date')
    list_filter = ('status', 'specialization')
    search_fields = ('full_name', 'email', 'license_number')

@admin.register(SecurityAuditLog)
class SecurityAuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'event_type', 'actor', 'description')
    list_filter = ('event_type',)
    search_fields = ('actor', 'description')
