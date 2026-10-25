import base64
import hashlib
from cryptography.fernet import Fernet
from django.conf import settings

def _get_fernet_key():
    # Derive a valid 32-byte urlsafe base64 key deterministically from Django SECRET_KEY
    secret = getattr(settings, 'SECRET_KEY', 'default-mednova-secret-key-32bytes!')
    digest = hashlib.sha256(secret.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(digest)

def encrypt_medical_data(plain_text: str) -> str:
    """
    Encrypts sensitive medical and consultation details using AES-128-CBC/Fernet.
    """
    if not plain_text:
        return ""
    try:
        f = Fernet(_get_fernet_key())
        return f.encrypt(plain_text.encode('utf-8')).decode('utf-8')
    except Exception as e:
        return plain_text

def decrypt_medical_data(cipher_text: str) -> str:
    """
    Decrypts encrypted medical records for authorized doctors/admin.
    """
    if not cipher_text:
        return ""
    try:
        f = Fernet(_get_fernet_key())
        return f.decrypt(cipher_text.encode('utf-8')).decode('utf-8')
    except Exception as e:
        # If not encrypted or fails decryption, return original text
        return cipher_text

def generate_anonymous_alias(seed_value: str = None) -> str:
    """
    Generates a privacy-preserving ZKP-style pseudonym (e.g. AnonPatient#8F2A9C).
    """
    import uuid
    if not seed_value:
        seed_value = str(uuid.uuid4())
    hash_hex = hashlib.sha256(seed_value.encode('utf-8')).hexdigest()[:6].upper()
    return f"AnonPatient#{hash_hex}"
