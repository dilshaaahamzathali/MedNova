/**
 * MedNova Mock Database & Initial State Store
 * Provides default accounts, doctor verification requests, consultation cases, articles, and audit logs.
 */

window.MedNovaData = {
  // Current active logged-in user state
  currentUser: {
    id: "usr_admin_01",
    name: "System Administrator",
    email: "admin@mednova.org",
    role: "ADMIN", // 'ADMIN' or 'DOCTOR'
    avatar: "SA"
  },

  // Registered Doctor Profiles & Verification Queue
  doctors: [
    {
      id: "doc_101",
      name: "Dr. Elizabeth Vance, MD",
      email: "elizabeth.vance@mednova.org",
      specialization: "Cardiology",
      licenseNumber: "MC-88492-USA",
      council: "American Board of Internal Medicine",
      hospital: "St. Jude Heart Institute",
      experienceYears: 14,
      status: "VERIFIED", // 'VERIFIED', 'PENDING_VERIFICATION', 'REJECTED'
      appliedDate: "2026-08-20",
      verifiedDate: "2026-08-21",
      documentUrl: "license_cert_88492.pdf"
    },
    {
      id: "doc_102",
      name: "Dr. Marcus Brody, DO",
      email: "marcus.brody@mednova.org",
      specialization: "General Medicine",
      licenseNumber: "MC-91024-USA",
      council: "American Osteopathic Association",
      hospital: "Metro Health Center",
      experienceYears: 9,
      status: "VERIFIED",
      appliedDate: "2026-08-22",
      verifiedDate: "2026-08-23",
      documentUrl: "license_cert_91024.pdf"
    },
    {
      id: "doc_103",
      name: "Dr. Aisha Sharma, MD",
      email: "aisha.sharma@mednova.org",
      specialization: "Neurology",
      licenseNumber: "MC-73918-IND",
      council: "Medical Council of India",
      hospital: "City Neuro Care Clinic",
      experienceYears: 11,
      status: "PENDING_VERIFICATION",
      appliedDate: "2026-08-29",
      verifiedDate: null,
      documentUrl: "license_cert_73918.pdf"
    },
    {
      id: "doc_104",
      name: "Dr. Jonathan Reed, MD",
      email: "jonathan.reed@mednova.org",
      specialization: "Dermatology",
      licenseNumber: "MC-45109-UK",
      council: "General Medical Council UK",
      hospital: "Royal Skin Institute",
      experienceYears: 7,
      status: "PENDING_VERIFICATION",
      appliedDate: "2026-08-30",
      verifiedDate: null,
      documentUrl: "license_cert_45109.pdf"
    }
  ],

  // Anonymous Patient Consultation Requests (ZKP protected identity)
  consultations: [
    {
      id: "ZKP-CASE-9904",
      anonymousHash: "0x8f4a2...e91c (Verified ZKP Identity)",
      ageRange: "35-44",
      gender: "Anonymous",
      symptoms: ["Chest tightness", "Shortness of breath on stairs", "Mild dizziness"],
      duration: "3 days",
      aiRiskScore: "HIGH_RISK", // 'LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK'
      aiConfidence: "92%",
      status: "NEW", // 'NEW', 'IN_REVIEW', 'RESOLVED'
      submittedDate: "2026-08-31 08:30 AM",
      assignedDoctorId: null,
      doctorAdvice: null
    },
    {
      id: "ZKP-CASE-8812",
      anonymousHash: "0x3c7e1...a45b (Verified ZKP Identity)",
      ageRange: "25-34",
      gender: "Anonymous",
      symptoms: ["Throbbing headache", "Visual aura flashes", "Sensitivity to light"],
      duration: "12 hours",
      aiRiskScore: "MODERATE_RISK",
      aiConfidence: "88%",
      status: "IN_REVIEW",
      submittedDate: "2026-08-30 06:15 PM",
      assignedDoctorId: "doc_103",
      doctorAdvice: null
    },
    {
      id: "ZKP-CASE-7741",
      anonymousHash: "0x1d90f...b882 (Verified ZKP Identity)",
      ageRange: "18-24",
      gender: "Anonymous",
      symptoms: ["Itchy skin rash on arms", "Mild erythema"],
      duration: "2 days",
      aiRiskScore: "LOW_RISK",
      aiConfidence: "95%",
      status: "RESOLVED",
      submittedDate: "2026-08-29 02:40 PM",
      assignedDoctorId: "doc_102",
      doctorAdvice: "Based on your description, this appears to be a localized contact dermatitis. Discontinue any new topical creams or dietary supplements introduced in the last 48 hours. Apply a mild hydrocortisone 1% cream twice daily. If swelling or hives develop, seek immediate urgent care."
    }
  ],

  // Health Awareness Articles published by doctors & moderated by admin
  articles: [
    {
      id: "art_301",
      title: "Understanding Early Cardiovascular Warning Signs",
      category: "Cardiology",
      authorId: "doc_101",
      authorName: "Dr. Elizabeth Vance, MD",
      status: "APPROVED", // 'APPROVED', 'PENDING_MODERATION', 'REJECTED'
      publishedDate: "2026-08-25",
      summary: "Key indicators of cardiovascular stress, prevention strategies, and when to seek emergency consultation.",
      content: "Cardiovascular health requires early vigilance. Symptoms such as sudden chest pressure, unexplained fatigue, and shortness of breath should never be ignored..."
    },
    {
      id: "art_302",
      title: "Navigating Migraine Triggers & Preventive Neurological Care",
      category: "Neurology",
      authorId: "doc_103",
      authorName: "Dr. Aisha Sharma, MD",
      status: "PENDING_MODERATION",
      publishedDate: "2026-08-30",
      summary: "Comprehensive guide to identifying dietary, environmental, and stress triggers for chronic migraines.",
      content: "Migraines affect over 1 billion people worldwide. Tracking environmental triggers and maintaining hydration are crucial first-line defense measures..."
    }
  ],

  // Security & Audit Logs
  auditLogs: [
    {
      id: "log_501",
      timestamp: "2026-08-31 09:12:04",
      eventType: "ADMIN_DOCTOR_APPROVAL",
      actor: "admin@mednova.org",
      description: "Approved doctor verification for Dr. Elizabeth Vance (License #MC-88492-USA). Verified badge issued."
    },
    {
      id: "log_502",
      timestamp: "2026-08-31 08:30:15",
      eventType: "ZKP_CASE_CREATED",
      actor: "Anonymous Patient (ZKP)",
      description: "Anonymous consultation ZKP-CASE-9904 created. Zero-Knowledge Proof payload validated."
    },
    {
      id: "log_503",
      timestamp: "2026-08-30 18:15:22",
      eventType: "DOCTOR_LOGIN_SUCCESS",
      actor: "marcus.brody@mednova.org",
      description: "Doctor authenticated successfully via JWT session."
    }
  ]
};
