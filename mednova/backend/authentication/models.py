from django.db import models
from django.contrib.auth.models import User

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile', null=True, blank=True)
    display_alias = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Patient: {self.display_alias} ({self.email})"

class DoctorProfile(models.Model):
    STATUS_CHOICES = (
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('VERIFIED', 'Verified Doctor'),
        ('REJECTED', 'Rejected'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile', null=True, blank=True)
    username = models.CharField(max_length=150, blank=True, null=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    specialization = models.CharField(max_length=150)
    license_number = models.CharField(max_length=100, unique=True)
    issuing_council = models.CharField(max_length=255, blank=True, default='National Medical Council')
    hospital_affiliation = models.CharField(max_length=255)
    experience_years = models.IntegerField(default=5)
    bio = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_VERIFICATION')
    applied_date = models.DateField(auto_now_add=True)
    verified_date = models.DateField(null=True, blank=True)
    verification_document = models.FileField(upload_to='doctor_licenses/', null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.specialization}) - {self.status}"


class SecurityAuditLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=100)
    actor = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.event_type} - {self.actor}"
