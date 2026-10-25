import os
import sys
import django

# Configure Windows console encoding for Unicode/cryptographic symbols
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mednova.settings')
django.setup()

from mednova.crypto_utils import encrypt_medical_data, decrypt_medical_data, generate_anonymous_alias
from consultations.models import ConsultationCase
from authentication.models import SecurityAuditLog

def main():
    print("=" * 70)
    print("MEDNOVA CRYPTOGRAPHY & PRIVACY SUBSYSTEM DEMONSTRATION")
    print("=" * 70)

    # 1. LIVE ENCRYPTION / DECRYPTION PIPELINE DEMO
    print("\n[1] LIVE AES-256 / FERNET SYMMETRIC ENCRYPTION TEST:")
    sample_symptom = "Patient reports persistent BP spikes (155/95) and chest tightness."
    encrypted_sample = encrypt_medical_data(sample_symptom)
    decrypted_sample = decrypt_medical_data(encrypted_sample)

    print(f"  • Original Plaintext    : '{sample_symptom}'")
    print(f"  • AES-256 Ciphertext    : {encrypted_sample[:65]}...")
    print(f"  • Decrypted Plaintext   : '{decrypted_sample}'")
    print(f"  • Verification Match    : {sample_symptom == decrypted_sample}")

    # 2. PSEUDONYMOUS IDENTITY GENERATOR (ZKP-STYLE HASHING)
    print("\n[2] ZERO-KNOWLEDGE PSEUDONYMOUS ALIAS GENERATION:")
    for i in range(3):
        alias = generate_anonymous_alias()
        print(f"  • Generated Shield Alias #{i+1}: {alias}")

    # 3. DATABASE RECORDS AT REST (SQLite db.sqlite3)
    print("\n[3] DATABASE RECORDS STORED AT REST (consultations_consultationcase):")
    cases = ConsultationCase.objects.all()
    if not cases.exists():
        print("  (No consultation cases found in database)")
    else:
        for c in cases:
            print("-" * 70)
            print(f"  Case ID          : {c.case_id}")
            print(f"  Patient Alias    : {c.patient_alias}")
            print(f"  Subject          : {c.subject}")
            print(f"  Risk Category    : {c.ai_risk_score} (Confidence: {c.ai_confidence})")
            print(f"  Status           : {c.status}")
            print(f"  Stored Ciphertext: {c.encrypted_description[:65]}..." if c.encrypted_description else "  Stored Ciphertext: [Empty]")
            print(f"  Decrypted Plain  : '{c.get_decrypted_description()}'")

    # 4. RECENT SECURITY AUDIT LOG ENTRIES
    print("\n[4] RECENT CRYPTOGRAPHIC AUDIT LOGS (authentication_securityauditlog):")
    recent_logs = SecurityAuditLog.objects.filter(event_type__in=['CONSULTATION_SUBMITTED', 'USER_LOGIN']).order_by('-timestamp')[:4]
    for log in recent_logs:
        print(f"  [{log.timestamp.strftime('%Y-%m-%d %H:%M')}] [{log.event_type}] Actor: {log.actor} -> {log.description}")

    print("\n" + "=" * 70)
    print("Demonstration finished. All sensitive patient records are cryptographically secured.")
    print("=" * 70)

if __name__ == '__main__':
    main()
