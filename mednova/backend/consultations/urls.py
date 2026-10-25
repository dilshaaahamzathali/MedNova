from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_consultations, name='get_consultations'),
    path('request/', views.request_consultation, name='request_consultation'),
    path('respond/<str:case_id>/', views.respond_case, name='respond_case'),
    path('my-consultations/', views.get_patient_consultations, name='get_patient_consultations'),
    path('assess-risk/', views.assess_health_risk, name='assess_health_risk'),
]
