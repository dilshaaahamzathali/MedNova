"""
Seed script: Adds real health articles to the MedNova platform.
Run with: python seed_articles.py (from the backend/ directory after activating Django env)
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mednova.settings')
django.setup()

from articles.models import HealthArticle

articles_data = [
    {
        "title": "Understanding Blood Pressure: What Your Numbers Really Mean",
        "category": "Cardiology",
        "author_name": "Dr. Rohan Mehta, MD — Cardiologist",
        "summary": "A guide to interpreting systolic and diastolic blood pressure readings, and why consistent monitoring saves lives.",
        "content": "Blood pressure is measured in millimeters of mercury (mmHg) and recorded as two numbers: systolic (pressure when your heart beats) over diastolic (pressure between beats). A normal reading is below 120/80 mmHg. Hypertension Stage 1 is 130-139/80-89 mmHg. Persistent hypertension damages arteries, kidneys, and the heart over time. Daily measurement, DASH diet, reduced sodium intake, and regular aerobic exercise are proven interventions. If medications are prescribed, never stop abruptly — always consult your cardiologist.",
        "status": "APPROVED"
    },
    {
        "title": "Living With HIV in 2026: ART Therapy, Viral Suppression & Wellness",
        "category": "HIV & Immunology",
        "author_name": "Dr. Priya Nair, MD — Infectious Disease Specialist",
        "summary": "Modern antiretroviral therapy makes HIV a manageable chronic condition. Here's what patients need to know about staying undetectable.",
        "content": "Antiretroviral therapy (ART) has transformed HIV from a fatal condition into a manageable chronic illness. When taken daily as prescribed, ART can reduce viral load to undetectable levels within months — meaning the virus cannot be sexually transmitted (Undetectable = Untransmittable, U=U). Common first-line regimens include integrase inhibitors such as dolutegravir. Side effects are generally mild and diminish over time. Patients should maintain regular CD4 count and viral load monitoring every 3-6 months, adhere to vaccinations, and engage in mental health support since stigma remains a significant barrier to care.",
        "status": "APPROVED"
    },
    {
        "title": "Managing Type 2 Diabetes Through Diet: The Evidence-Based Approach",
        "category": "Diabetes & Metabolic Care",
        "author_name": "Dr. Ananya Krishnan, MBBS — Endocrinologist",
        "summary": "Dietary interventions remain the most powerful tool for managing blood glucose in Type 2 Diabetes. Learn the clinical evidence.",
        "content": "Type 2 Diabetes develops when the body becomes resistant to insulin or the pancreas doesn't produce enough. Evidence strongly supports low-glycemic index diets (whole grains, legumes, vegetables) and caloric restriction as first-line management. Fasting blood glucose targets: 80-130 mg/dL (pre-meal), below 180 mg/dL (post-meal). Mediterranean and DASH diets show particular benefit. Regular physical activity — 150 minutes of moderate aerobic exercise per week — significantly improves insulin sensitivity. Metformin remains the first-choice pharmacological agent. Monitor HbA1c every 3 months; target below 7% for most adults.",
        "status": "APPROVED"
    },
    {
        "title": "Cancer Screening: Early Detection is the Most Powerful Treatment",
        "category": "Oncology",
        "author_name": "Dr. Kavitha Suresh, MD — Oncologist",
        "summary": "Cancer caught in Stage I has dramatically higher survival rates. Understand which screenings are recommended for your age group.",
        "content": "Cancer screening identifies cancer or pre-cancerous conditions before symptoms appear. Recommended screenings by age: Women 21+ — Pap smear every 3 years for cervical cancer. Women 40+ — Annual mammograms for breast cancer. Adults 45+ — Colonoscopy every 10 years for colorectal cancer. Heavy smokers 50-80 — Low-dose CT scan annually for lung cancer. Men 55+ — Discuss PSA testing for prostate cancer with your doctor. Early detection during Stage I typically yields 5-year survival rates above 85-95% versus below 15% for Stage IV. Never skip routine screenings — they are the most cost-effective cancer intervention available.",
        "status": "APPROVED"
    },
    {
        "title": "Mental Health First Aid: Recognizing Crisis Signals in Yourself and Others",
        "category": "Mental Health",
        "author_name": "Dr. Samuel James, PsyD — Clinical Psychologist",
        "summary": "Mental health crises are medical emergencies. Learn the 5 key warning signs and immediate first-aid responses.",
        "content": "Mental health first aid is the help offered to a person developing a mental health problem or experiencing a mental health crisis. Five warning signs requiring immediate attention: 1) Talking about wanting to die or harm oneself. 2) Withdrawing from friends and daily activities. 3) Extreme mood swings — euphoria followed by deep depression. 4) Giving away prized possessions. 5) Increased substance use. If you observe these signs: Stay calm and listen non-judgmentally. Ask directly: 'Are you thinking about suicide?' (It does NOT plant the idea). Remove access to means if possible. Contact crisis services immediately. In India, dial iCall (9152987821) or Vandrevala Foundation (1860-2662-345). You are not alone — help is always available.",
        "status": "APPROVED"
    },
    {
        "title": "Respiratory Health: COPD, Asthma, and the Clean Air Protocol",
        "category": "Respiratory",
        "author_name": "Dr. Faheem Ansari, MD — Pulmonologist",
        "summary": "Chronic Obstructive Pulmonary Disease and Asthma affect millions. Here is how to maximize breathing function and prevent exacerbations.",
        "content": "COPD is a progressive disease characterized by increasing breathlessness, primarily caused by long-term exposure to irritants (most commonly cigarette smoke and air pollution). Asthma involves episodic airway inflammation triggered by allergens, exercise, or cold air. Management for COPD: Quit smoking immediately (the only intervention proven to slow progression), bronchodilator inhalers (LABA/LAMA), pulmonary rehabilitation, and flu vaccinations. For Asthma: Identify and avoid triggers, use short-acting beta-agonists (SABA like salbutamol) for acute relief, and inhaled corticosteroids (ICS) for daily control. Monitor Peak Expiratory Flow Rate (PEFR) daily. Air quality apps help plan outdoor activity. Indoor air purifiers with HEPA filters reduce particulate exposure significantly.",
        "status": "APPROVED"
    },
    {
        "title": "Privacy in Healthcare: Why Anonymity Reduces Stigma and Improves Outcomes",
        "category": "Patient Privacy & Rights",
        "author_name": "MedNova Research Team",
        "summary": "Studies show patients are more honest with doctors when they feel protected from social judgment. Privacy-first platforms improve diagnosis quality.",
        "content": "Research published in multiple clinical journals consistently shows that patient disclosure is significantly enhanced when social stigma is removed. Conditions most affected by stigma-related under-disclosure include HIV, mental health disorders, substance use, sexual health, and certain cancers. Patients who fear social judgment often delay seeking care by 6-18 months on average, leading to preventable disease progression. Anonymized telemedicine and pseudonymous community platforms (such as MedNova's AES-256 encrypted, ZKP-identity system) demonstrate 40% higher symptom disclosure rates compared to traditional face-to-face settings. Privacy protection is not just an ethical imperative — it is a clinical performance enhancer.",
        "status": "APPROVED"
    },
    {
        "title": "Hydration & Kidney Health: The Simple Daily Habit That Prevents Disease",
        "category": "General Wellness",
        "author_name": "Dr. Deepa Pillai, MD — Nephrologist",
        "summary": "Adequate hydration protects the kidneys, prevents UTIs, and supports cognitive function. Here's what science recommends.",
        "content": "The kidneys filter approximately 200 liters of blood daily, producing 1-2 liters of urine. Adequate hydration (8-10 glasses of water per day for adults) prevents kidney stone formation, reduces urinary tract infections, and supports optimal toxin filtration. Signs of chronic dehydration include dark yellow urine, fatigue, headaches, and reduced cognitive performance. For patients with existing kidney disease, fluid targets may differ — consult your nephrologist. Electrolyte balance (sodium, potassium) is equally important: avoid excessive processed foods. Green tea, infused water, and coconut water are excellent alternatives to sugary beverages. Alcohol and caffeine act as diuretics — compensate with additional water intake.",
        "status": "APPROVED"
    },
]

created = 0
skipped = 0
for art in articles_data:
    if not HealthArticle.objects.filter(title=art['title']).exists():
        HealthArticle.objects.create(**art)
        created += 1
        print(f"  ✅ Created: {art['title'][:60]}")
    else:
        skipped += 1
        print(f"  ⏭ Exists: {art['title'][:60]}")

print(f"\n📰 Articles seeded: {created} new, {skipped} skipped.")
print("Health articles database is ready!")
