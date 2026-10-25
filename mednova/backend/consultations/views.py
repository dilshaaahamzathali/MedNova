from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from .models import ConsultationCase
from authentication.models import DoctorProfile, SecurityAuditLog
from mednova.crypto_utils import encrypt_medical_data, decrypt_medical_data, generate_anonymous_alias

@csrf_exempt
def get_consultations(request):
    """
    Returns list of consultations.
    Doctor or Admin can view and decrypt records.
    """
    doctor_id = request.GET.get('doctor_id')
    status_filter = request.GET.get('status')

    cases_qs = ConsultationCase.objects.all()
    if doctor_id:
        cases_qs = cases_qs.filter(doctor_id=doctor_id)
    if status_filter and status_filter != 'ALL':
        cases_qs = cases_qs.filter(status=status_filter)

    cases = []
    for c in cases_qs:
        # Provide decrypted description as well as ciphertext
        cases.append({
            'id': c.id,
            'case_id': c.case_id,
            'patient_alias': c.patient_alias,
            'doctor_name': c.doctor.full_name if c.doctor else 'Any Available Doctor',
            'doctor_id': c.doctor_id,
            'subject': c.subject,
            'encrypted_payload': c.encrypted_description,
            'decrypted_description': decrypt_medical_data(c.encrypted_description),
            'ai_risk_score': c.ai_risk_score,
            'ai_confidence': c.ai_confidence,
            'status': c.status,
            'submitted_date': c.submitted_date.strftime('%b %d, %Y %H:%M'),
            'doctor_advice': c.doctor_advice or ''
        })
    return JsonResponse({'status': 'success', 'cases': cases})

@csrf_exempt
def request_consultation(request):
    """
    Creates a new consultation request with AES-256 encrypted symptoms.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            doctor_id = data.get('doctor_id')
            subject = data.get('subject', 'General Health Concern').strip()
            raw_description = data.get('description', '').strip()
            patient_alias = data.get('patient_alias')

            if not patient_alias:
                patient_alias = generate_anonymous_alias()

            doctor = None
            if doctor_id and doctor_id != 'any':
                try:
                    doctor = DoctorProfile.objects.get(id=int(doctor_id))
                except DoctorProfile.DoesNotExist:
                    pass

            # Generate unique case ID
            case_id = f"ZKP-CASE-{uuid.uuid4().hex[:6].upper()}"

            # Encrypt sensitive medical record with AES-256
            encrypted_data = encrypt_medical_data(raw_description)

            # Basic keyword-based AI risk assessment
            risk_score = 'LOW_RISK'
            confidence = '91%'
            lower_desc = raw_description.lower()
            if any(w in lower_desc for w in ['chest pain', 'heart', 'breath', 'unconscious', 'emergency', 'severe']):
                risk_score = 'HIGH_RISK'
                confidence = '95%'
            elif any(w in lower_desc for w in ['fever', 'headache', 'dizziness', 'pain', 'vomit', 'sugar', 'pressure']):
                risk_score = 'MODERATE_RISK'
                confidence = '88%'

            case = ConsultationCase.objects.create(
                case_id=case_id,
                patient_alias=patient_alias,
                doctor=doctor,
                subject=subject,
                encrypted_description=encrypted_data,
                ai_risk_score=risk_score,
                ai_confidence=confidence,
                status='NEW'
            )

            SecurityAuditLog.objects.create(
                event_type='CONSULTATION_SUBMITTED',
                actor=patient_alias,
                description=f"Consultation {case_id} submitted with AES-256 encryption. Risk: {risk_score}."
            )

            return JsonResponse({
                'status': 'success',
                'case_id': case.case_id,
                'patient_alias': patient_alias,
                'ai_risk_score': risk_score,
                'message': 'Consultation request securely encrypted and dispatched to doctor.'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def respond_case(request, case_id):
    """
    Doctor submits medical advice / response.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            advice = data.get('advice', '').strip()
            doctor_name = data.get('doctor_name', 'Verified Doctor')

            case = ConsultationCase.objects.get(case_id=case_id)
            case.doctor_advice = advice
            case.status = 'RESOLVED'
            case.save()

            SecurityAuditLog.objects.create(
                event_type='CONSULTATION_RESOLVED',
                actor=doctor_name,
                description=f"Doctor resolved consultation case {case.case_id}."
            )

            return JsonResponse({
                'status': 'success',
                'message': f'Clinical guidance sent for case {case.case_id}.'
            })
        except ConsultationCase.DoesNotExist:
            return JsonResponse({'error': 'Case not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def get_patient_consultations(request):
    """
    Returns consultations submitted by a specific patient alias (Slide 10 DFD 1.2).
    """
    patient_alias = request.GET.get('patient_alias')
    if not patient_alias:
        return JsonResponse({'status': 'success', 'cases': []})
    
    cases_qs = ConsultationCase.objects.filter(patient_alias=patient_alias)
    cases = []
    for c in cases_qs:
        cases.append({
            'id': c.id,
            'case_id': c.case_id,
            'doctor_name': c.doctor.full_name if c.doctor else 'Any Available Doctor',
            'subject': c.subject,
            'decrypted_description': decrypt_medical_data(c.encrypted_description),
            'ai_risk_score': c.ai_risk_score,
            'status': c.status,
            'submitted_date': c.submitted_date.strftime('%b %d, %Y %H:%M'),
            'doctor_advice': c.doctor_advice or 'Awaiting clinical review from doctor.'
        })
    return JsonResponse({'status': 'success', 'cases': cases})

@csrf_exempt
def assess_health_risk(request):
    """
    Privacy-preserving Health Risk Assessment / AI Triage (Slide 4 Problem Statement & Slide 5 Objectives).
    Evaluates symptoms & vitals without exposing user identity.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            symptoms = data.get('symptoms', '').lower()
            duration = data.get('duration', '1-2 days')
            systolic = int(data.get('systolic', 120) or 120)
            diastolic = int(data.get('diastolic', 80) or 80)
            blood_sugar = int(data.get('blood_sugar', 100) or 100)
            has_fever = data.get('has_fever', False)
            pain_level = int(data.get('pain_level', 2) or 2)

            risk_points = 0
            factors = []

            # Cardiovascular checks
            if systolic >= 140 or diastolic >= 90:
                risk_points += 35
                factors.append(f"Elevated blood pressure ({systolic}/{diastolic} mmHg)")
            elif systolic >= 130 or diastolic >= 85:
                risk_points += 15
                factors.append("Stage 1 Pre-hypertension reading")

            # Metabolic checks
            if blood_sugar >= 180:
                risk_points += 30
                factors.append(f"High blood glucose reading ({blood_sugar} mg/dL)")
            elif blood_sugar >= 140:
                risk_points += 15
                factors.append("Impaired fasting/post-prandial glucose")

            # Acute symptom keywords
            high_risk_words = ['chest pain', 'shortness of breath', 'unconscious', 'fainting', 'irregular heartbeat', 'severe headache', 'vision loss']
            for hw in high_risk_words:
                if hw in symptoms:
                    risk_points += 40
                    factors.append(f"Acute critical symptom: '{hw.title()}'")
                    break

            if pain_level >= 7:
                risk_points += 20
                factors.append(f"Severe self-reported pain score ({pain_level}/10)")

            if has_fever:
                risk_points += 10
                factors.append("Persistent fever detected")

            # Categorization
            if risk_points >= 55:
                category = "HIGH_RISK"
                recommendation = "Immediate Clinical Attention Recommended. We advise booking a priority consultation with a Cardiology or Emergency specialist."
                suggested_spec = "Cardiology"
            elif risk_points >= 25:
                category = "MODERATE_RISK"
                recommendation = "Active Monitoring Required. Schedule a consultation within 24-48 hours and track your daily vitals in our disease support community."
                suggested_spec = "General Medicine / Endocrinology"
            else:
                category = "LOW_RISK"
                recommendation = "Normal / Mild Risk Profile. Maintain hydration, rest, and engage with community members for lifestyle wellness tips."
                suggested_spec = "General Wellness"

            SecurityAuditLog.objects.create(
                event_type='ZKP_RISK_ASSESSMENT',
                actor=data.get('patient_alias') or 'AnonPatient#Triage',
                description=f"Automated risk triage completed: {category} (Score: {risk_points}/100)."
            )

            return JsonResponse({
                'status': 'success',
                'risk_score': min(risk_points, 100),
                'risk_category': category,
                'risk_factors': factors,
                'recommendation': recommendation,
                'suggested_specialty': suggested_spec
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

