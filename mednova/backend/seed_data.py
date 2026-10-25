import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mednova.settings')
django.setup()

from django.contrib.auth.models import User
from authentication.models import DoctorProfile, PatientProfile, SecurityAuditLog
from consultations.models import ConsultationCase
from communities.models import Community, CommunityPost
from mednova.crypto_utils import encrypt_medical_data

print("Seeding MedNova SQLite Database with Slide 13-16 specs...")

# 1. Superuser Admin
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mednova.org', 'admin123')
    print("  -> Admin Superuser created: admin / admin123")

# 2. Disease Support Groups (Slide 16)
communities_data = [
    {
        'name': 'Cardiology & Heart Health',
        'slug': 'cardiology-heart-health',
        'specialty_tag': 'Cardiology',
        'description': 'Support network for individuals tracking cardiovascular wellness, hypertension, and recovery.',
        'icon': 'fa-heart-pulse'
    },
    {
        'name': 'Diabetes & Metabolic Care',
        'slug': 'diabetes-metabolic-care',
        'specialty_tag': 'Endocrinology',
        'description': 'Share advice on glucose management, dietary plans, and lifestyle tracking.',
        'icon': 'fa-droplet'
    },
    {
        'name': 'Respiratory & Asthma Circle',
        'slug': 'respiratory-asthma-circle',
        'specialty_tag': 'Pulmonology',
        'description': 'Community discussions on breathing techniques, asthma management, and ambient air.',
        'icon': 'fa-lungs'
    },
    {
        'name': 'HIV & Immunology Support Circle',
        'slug': 'hiv-immunology-support',
        'specialty_tag': 'Infectious Disease',
        'description': 'A 100% stigma-free, confidential space discussing ART therapy, viral suppression, holistic immune health, and mental well-being.',
        'icon': 'fa-shield-virus'
    },
    {
        'name': 'Oncology & Cancer Care Network',
        'slug': 'oncology-cancer-care',
        'specialty_tag': 'Oncology',
        'description': 'A compassionate support network for patients, survivors, and caregivers navigating chemotherapy, radiation, surgery, and remission.',
        'icon': 'fa-ribbon'
    },
    {
        'name': 'Mental Health & Anxiety Sanctuary',
        'slug': 'mental-health-anxiety',
        'specialty_tag': 'Psychiatry & Psychology',
        'description': 'Safe, anonymous peer support exploring mindfulness, cognitive behavioral coping tools, and managing everyday anxiety & stress.',
        'icon': 'fa-brain'
    },
    {
        'name': 'Autoimmune & Chronic Wellness',
        'slug': 'autoimmune-chronic-wellness',
        'specialty_tag': 'Rheumatology',
        'description': 'Discussions on managing inflammation, lupus, rheumatoid arthritis, fibromyalgia, and chronic fatigue through lifestyle & medicine.',
        'icon': 'fa-dna'
    }
]

for c_data in communities_data:
    comm, created = Community.objects.get_or_create(
        slug=c_data['slug'],
        defaults=c_data
    )
    if created:
        print(f"  -> Created Community: {comm.name}")

# Seed Slide 16 Anonymous Post
cardio_comm = Community.objects.filter(slug='cardiology-heart-health').first()
if cardio_comm and not CommunityPost.objects.filter(title='Managing daily BP spike naturally').exists():
    CommunityPost.objects.create(
        community=cardio_comm,
        author_alias='AnonPatient#8F2A9C',
        title='Managing daily BP spike naturally',
        content='I found that morning meditation and sodium reduction helped keep my systolic readings under 125.',
        likes_count=4
    )
    print("  -> Created Slide 16 Anonymous Cardiology Post")

# 3. Verified and Pending Doctors (Slide 15)
if not User.objects.filter(username='dr_smith').exists():
    smith_user = User.objects.create_user('dr_smith', 'doctor@hospital.org', 'smith123')
    DoctorProfile.objects.create(
        user=smith_user,
        username='dr_smith',
        full_name='Dr. Smith, MD',
        email='doctor@hospital.org',
        specialization='Cardiology, General Medicine',
        license_number='MD-123456',
        hospital_affiliation='City Hospital',
        bio='Cardiology specialist with 10+ years experience in preventive care and patient consultations.',
        experience_years=10,
        status='VERIFIED'
    )
    print("  -> Created Verified Doctor: dr_smith (password: smith123)")

if not User.objects.filter(username='dr_reed').exists():
    reed_user = User.objects.create_user('dr_reed', 'reed@hospital.org', 'reed123')
    DoctorProfile.objects.create(
        user=reed_user,
        username='dr_reed',
        full_name='Dr. Jonathan Reed, MD',
        email='reed@hospital.org',
        specialization='Dermatology',
        license_number='MD-45109-UK',
        hospital_affiliation='Royal Skin Institute',
        bio='Clinical dermatologist specializing in inflammatory skin diseases.',
        experience_years=7,
        status='PENDING_VERIFICATION'
    )
    print("  -> Created Pending Doctor: dr_reed (password: reed123)")

# 4. Sample Patient (Slide 16: bluewhale)
if not User.objects.filter(username='patient@example.com').exists():
    p_user = User.objects.create_user('patient@example.com', 'patient@example.com', 'patient123')
    PatientProfile.objects.create(
        user=p_user,
        display_alias='bluewhale',
        email='patient@example.com'
    )
    print("  -> Created Patient: bluewhale / patient123")

# 5. Consultation Case (Slide 15)
smith_doc = DoctorProfile.objects.filter(username='dr_smith').first()
if not ConsultationCase.objects.filter(case_id='ZKP-CASE-9904').exists():
    case = ConsultationCase(
        case_id='ZKP-CASE-9904',
        patient_alias='AnonPatient#8F2A9C',
        doctor=smith_doc,
        subject='Sharp chest pain during exercise',
        symptoms='Chest discomfort, shortness of breath on stairs',
        ai_risk_score='HIGH_RISK',
        ai_confidence='95%',
        status='NEW'
    )
    case.set_description('Sharp chest pain during exercise. Felt slight constriction radiating to left shoulder.')
    case.save()
    print("  -> Created Encrypted Consultation Case: ZKP-CASE-9904")

print("Seeding completed successfully!")
