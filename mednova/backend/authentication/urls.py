from django.urls import path
from . import views

urlpatterns = [
    path('register-patient/', views.register_patient, name='register_patient'),
    path('register-doctor/', views.register_doctor, name='register_doctor'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('doctors/', views.list_doctors, name='list_doctors'),
    path('verify-doctor/<int:doctor_id>/', views.verify_doctor, name='verify_doctor'),
    path('audit-logs/', views.get_audit_logs, name='get_audit_logs'),
    path('patients/', views.list_patients, name='list_patients'),
    path('patients/<int:patient_id>/toggle/', views.toggle_patient_status, name='toggle_patient_status'),
]
