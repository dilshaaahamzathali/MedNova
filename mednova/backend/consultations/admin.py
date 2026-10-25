from django.contrib import admin
from .models import ConsultationCase

@admin.register(ConsultationCase)
class ConsultationCaseAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'patient_alias', 'doctor', 'subject', 'ai_risk_score', 'status', 'submitted_date')
    list_filter = ('status', 'ai_risk_score')
    search_fields = ('case_id', 'patient_alias', 'subject')
