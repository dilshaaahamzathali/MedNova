from django.db import models
from authentication.models import DoctorProfile
from mednova.crypto_utils import encrypt_medical_data, decrypt_medical_data

class ConsultationCase(models.Model):
    STATUS_CHOICES = (
        ('NEW', 'New Request'),
        ('IN_REVIEW', 'In Review'),
        ('RESOLVED', 'Resolved'),
    )

    case_id = models.CharField(max_length=50, unique=True)
    patient_alias = models.CharField(max_length=150, default='AnonPatient')
    anonymous_hash = models.CharField(max_length=255, default='0xZKP-Anon')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='consultations')
    subject = models.CharField(max_length=255, default='General Medical Concern')
    encrypted_description = models.TextField(default='', blank=True) # Sensitive symptom record encrypted with AES-256
    symptoms = models.TextField(blank=True, default='') # Summary keywords
    duration = models.CharField(max_length=100, default='Recent')
    ai_risk_score = models.CharField(max_length=50, default='LOW_RISK')
    ai_confidence = models.CharField(max_length=20, default='92%')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='NEW')
    submitted_date = models.DateTimeField(auto_now_add=True)
    doctor_advice = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_date']

    def set_description(self, plain_text):
        self.encrypted_description = encrypt_medical_data(plain_text)

    def get_decrypted_description(self):
        return decrypt_medical_data(self.encrypted_description)

    def __str__(self):
        return f"{self.case_id} - {self.subject} [{self.status}]"
