import os
import django
import sys

# Force UTF-8 encoding on standard output for Windows console
sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mednova.settings')
django.setup()

from django.contrib.auth.models import User
from authentication.models import DoctorProfile, PatientProfile, SecurityAuditLog
from consultations.models import ConsultationCase
from communities.models import Community, CommunityPost, CommunityReply

print("=" * 70)
print("             MEDNOVA SQLITE DATABASE INSPECTION")
print("=" * 70)

print(f"\n[1] REGISTERED USERS ({User.objects.count()} records):")
for u in User.objects.all():
    role = "Superuser/Admin" if u.is_superuser else "Staff" if u.is_staff else "Standard User"
    print(f"   * ID: {u.id} | Username: {u.username:<20} | Role: {role}")

print(f"\n[2] DOCTOR PROFILES ({DoctorProfile.objects.count()} records):")
for d in DoctorProfile.objects.all():
    print(f"   * {d.full_name:<24} | Spec: {d.specialization:<25} | Status: [{d.status}] | Lic: {d.license_number}")

print(f"\n[3] PATIENT PROFILES ({PatientProfile.objects.count()} records):")
for p in PatientProfile.objects.all():
    print(f"   * Alias: {p.display_alias:<18} | Email: {p.email}")

print(f"\n[4] CONSULTATION CASES ({ConsultationCase.objects.count()} records):")
for c in ConsultationCase.objects.all():
    doc = c.doctor.full_name if c.doctor else "Any Doctor"
    print(f"   * Case: {c.case_id} | Patient: {c.patient_alias} | Doctor: {doc} | Status: [{c.status}]")
    print(f"     Subject: {c.subject}")
    print(f"     Decrypted Description: {c.get_decrypted_description()[:70]}...")

print(f"\n[5] COMMUNITIES & DISCUSSIONS:")
for comm in Community.objects.all():
    print(f"   * Community: {comm.name} ({comm.posts.count()} posts)")
    for post in comm.posts.all():
        print(f"     - Post by {post.author_alias}: '{post.title}' ({post.replies.count()} replies)")

print(f"\n[6] RECENT SECURITY AUDIT LOGS (Last 5):")
for log in SecurityAuditLog.objects.all()[:5]:
    print(f"   * [{log.timestamp.strftime('%Y-%m-%d %H:%M')}] {log.event_type:<22} | {log.actor}: {log.description[:50]}...")

print("\n" + "=" * 70)
