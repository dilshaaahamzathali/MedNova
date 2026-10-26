from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
import json
from .models import DoctorProfile, PatientProfile, SecurityAuditLog
from mednova.crypto_utils import generate_anonymous_alias
from functools import wraps
from django.contrib.auth.decorators import login_required


def admin_required(view_func):
    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):
        if not request.user.is_staff and not request.user.is_superuser:
            return JsonResponse(
                {'error': 'Administrator access required'},
                status=403
            )
        return view_func(request, *args, **kwargs)
    return wrapper

@csrf_exempt
@admin_required
def register_patient(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip()
            display_alias = data.get('display_alias', '').strip()
            password = data.get('password', '')

            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=400)

            if not display_alias:
                display_alias = generate_anonymous_alias(email)

            if User.objects.filter(username=email).exists() or PatientProfile.objects.filter(email=email).exists():
                return JsonResponse({'error': 'An account with this email already exists'}, status=400)

            user = User.objects.create_user(username=email, email=email, password=password)
            patient = PatientProfile.objects.create(
                user=user,
                display_alias=display_alias,
                email=email
            )

            SecurityAuditLog.objects.create(
                event_type='PATIENT_SIGNUP',
                actor=display_alias,
                description=f"New patient account created with alias: {display_alias}"
            )

            return JsonResponse({
                'status': 'success',
                'message': 'Patient account created successfully!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'alias': patient.display_alias,
                    'role': 'PATIENT'
                }
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def register_doctor(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            specialization = data.get('specialization', '')
            license_number = data.get('license_number', '').strip()
            hospital = data.get('hospital_affiliation', '')
            bio = data.get('bio', '')

            if not email or not license_number:
                return JsonResponse({'error': 'Official email and Medical License Number are required'}, status=400)

            if DoctorProfile.objects.filter(email=email).exists():
                return JsonResponse({'error': 'A doctor application with this email already exists'}, status=400)

            if DoctorProfile.objects.filter(license_number=license_number).exists():
                return JsonResponse({'error': 'This Medical License Number is already registered'}, status=400)

            user = None
            if username and password:
                if User.objects.filter(username=username).exists():
                    return JsonResponse({'error': 'Username already taken. Please choose another.'}, status=400)
                user = User.objects.create_user(username=username, email=email, password=password)

            doc = DoctorProfile.objects.create(
                user=user,
                username=username,
                full_name=data.get('full_name') or f"Dr. {username.replace('_', ' ').title()}",
                email=email,
                specialization=specialization,
                license_number=license_number,
                hospital_affiliation=hospital,
                bio=bio,
                experience_years=data.get('experience_years', 5),
                status='PENDING_VERIFICATION'
            )

            SecurityAuditLog.objects.create(
                event_type='DOCTOR_APPLICATION',
                actor=doc.email,
                description=f"Doctor credentials submitted: Dr. {doc.username or doc.full_name} (License #{doc.license_number}). Awaiting Admin verification."
            )

            return JsonResponse({
                'status': 'success',
                'doctor_id': doc.id,
                'message': 'Doctor application submitted! Administrator will verify credentials.'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '')

            # Check if user exists
            user = authenticate(username=username, password=password)
            if not user:
                # Try finding by email
                try:
                    u_obj = User.objects.get(email=username)
                    user = authenticate(username=u_obj.username, password=password)
                except User.DoesNotExist:
                    pass

            if user is not None:
                django_login(request, user)
                
                # Determine role
                role = 'PATIENT'
                alias = user.username
                doctor_id = None
                doctor_status = None

                if user.is_superuser or user.is_staff:
                    role = 'ADMIN'
                    alias = 'Admin Officer'
                elif hasattr(user, 'doctor_profile'):
                    role = 'DOCTOR'
                    alias = user.doctor_profile.full_name
                    doctor_id = user.doctor_profile.id
                    doctor_status = user.doctor_profile.status
                elif hasattr(user, 'patient_profile'):
                    role = 'PATIENT'
                    alias = user.patient_profile.display_alias
                
                SecurityAuditLog.objects.create(
                    event_type='USER_LOGIN',
                    actor=alias,
                    description=f"{role} logged into MedNova platform."
                )

                return JsonResponse({
                    'status': 'success',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'alias': alias,
                        'role': role,
                        'doctor_id': doctor_id,
                        'doctor_status': doctor_status
                    }
                })
            else:
                return JsonResponse({'error': 'Invalid username or password'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def logout_user(request):
    django_logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})

@csrf_exempt
def list_doctors(request):
    doctors = []
    for d in DoctorProfile.objects.all():
        doctors.append({
            'id': d.id,
            'full_name': d.full_name,
            'specialization': d.specialization,
            'license_number': d.license_number,
            'hospital_affiliation': d.hospital_affiliation,
            'experience_years': d.experience_years,
            'bio': d.bio,
            'status': d.status,
            'applied_date': d.applied_date.strftime('%Y-%m-%d')
        })
    return JsonResponse({'status': 'success', 'doctors': doctors})

@csrf_exempt
def verify_doctor(request, doctor_id):
    if request.method == 'POST':
        action = request.GET.get('action', 'approve')
        try:
            doc = DoctorProfile.objects.get(id=doctor_id)
            if action == 'approve':
                doc.status = 'VERIFIED'
                doc.save()
                SecurityAuditLog.objects.create(
                    event_type='DOCTOR_VERIFIED',
                    actor='Admin',
                    description=f"Verified doctor {doc.full_name} (License #{doc.license_number}). Badge granted."
                )
                return JsonResponse({'status': 'success', 'message': f'Doctor {doc.full_name} has been VERIFIED!'})
            else:
                doc.status = 'REJECTED'
                doc.save()
                SecurityAuditLog.objects.create(
                    event_type='DOCTOR_REJECTED',
                    actor='Admin',
                    description=f"Rejected doctor registration {doc.full_name}."
                )
                return JsonResponse({'status': 'success', 'message': f'Doctor {doc.full_name} rejected.'})
        except DoctorProfile.DoesNotExist:
            return JsonResponse({'error': 'Doctor not found'}, status=404)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def get_audit_logs(request):
    logs = [{
        'id': l.id,
        'timestamp': l.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'event_type': l.event_type,
        'actor': l.actor,
        'description': l.description
    } for l in SecurityAuditLog.objects.all()[:50]]
    return JsonResponse({'status': 'success', 'logs': logs})

@csrf_exempt
def list_patients(request):
    """Admin endpoint for Patient Management (Slide 9 DFD 1.1)"""
    patients = []
    for p in PatientProfile.objects.all().select_related('user'):
        patients.append({
            'id': p.id,
            'display_alias': p.display_alias,
            'email': p.email,
            'created_at': p.created_at.strftime('%Y-%m-%d %H:%M'),
            'is_active': p.user.is_active if p.user else True
        })
    return JsonResponse({'status': 'success', 'patients': patients})

@csrf_exempt
def toggle_patient_status(request, patient_id):
    """Admin endpoint to activate/suspend a patient account"""
    if request.method == 'POST':
        try:
            patient = PatientProfile.objects.get(id=patient_id)
            if patient.user:
                patient.user.is_active = not patient.user.is_active
                patient.user.save()
                status_text = 'activated' if patient.user.is_active else 'suspended'
                SecurityAuditLog.objects.create(
                    event_type='ADMIN_PATIENT_UPDATE',
                    actor='Admin',
                    description=f"Admin {status_text} patient account: {patient.display_alias}"
                )
                return JsonResponse({'status': 'success', 'is_active': patient.user.is_active, 'message': f'Patient account {status_text}.'})
            return JsonResponse({'error': 'Patient user record not found'}, status=404)
        except PatientProfile.DoesNotExist:
            return JsonResponse({'error': 'Patient not found'}, status=404)
    return JsonResponse({'error': 'POST method required'}, status=400)

