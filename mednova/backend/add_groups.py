import os
import django
import sys

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mednova.settings')
django.setup()

from communities.models import Community, CommunityPost

new_groups = [
    {
        'name': 'HIV & Immunology Support Circle',
        'slug': 'hiv-immunology-support',
        'specialty_tag': 'Infectious Disease',
        'description': 'A 100% stigma-free, confidential space discussing ART therapy, viral suppression, holistic immune health, and mental well-being.',
        'icon': 'fa-shield-virus',
        'post': {
            'author_alias': 'AnonPatient#9E4D1A',
            'title': 'Tips on ART adherence and managing mild nausea in week 2',
            'content': 'Taking my regimen with a small meal before bed practically eliminated the initial nausea. Viral load is already trending downward!'
        }
    },
    {
        'name': 'Oncology & Cancer Care Network',
        'slug': 'oncology-cancer-care',
        'specialty_tag': 'Oncology',
        'description': 'A compassionate support network for patients, survivors, and caregivers navigating chemotherapy, radiation, surgery, and remission.',
        'icon': 'fa-ribbon',
        'post': {
            'author_alias': 'AnonPatient#C72A08',
            'title': 'Nutrition and hydration strategies during chemo cycles',
            'content': 'Electrolyte fluids and ginger tea helped tremendously during day 3-5 post-infusion. Sending strength to everyone in treatment.'
        }
    },
    {
        'name': 'Mental Health & Anxiety Sanctuary',
        'slug': 'mental-health-anxiety',
        'specialty_tag': 'Psychiatry & Psychology',
        'description': 'Safe, anonymous peer support exploring mindfulness, cognitive behavioral coping tools, and managing everyday anxiety & stress.',
        'icon': 'fa-brain',
        'post': {
            'author_alias': 'AnonPatient#4B10FE',
            'title': 'The 4-7-8 breathing method for nocturnal anxiety spikes',
            'content': 'Practicing slow 4-7-8 breathwork when waking up with high heart rate has helped me settle back to sleep without panic.'
        }
    },
    {
        'name': 'Autoimmune & Chronic Wellness',
        'slug': 'autoimmune-chronic-wellness',
        'specialty_tag': 'Rheumatology',
        'description': 'Discussions on managing inflammation, lupus, rheumatoid arthritis, fibromyalgia, and chronic fatigue through lifestyle & medicine.',
        'icon': 'fa-dna',
        'post': {
            'author_alias': 'AnonPatient#6D3A99',
            'title': 'Tracking morning joint stiffness flare-ups with a weather log',
            'content': 'I noticed barometric pressure drops correlate with knee and finger swelling. Gentle warm water stretches help ease the morning stiffness.'
        }
    }
]

print("Adding Support Groups to MedNova Database...")
for g in new_groups:
    post_info = g.pop('post')
    comm, created = Community.objects.get_or_create(slug=g['slug'], defaults=g)
    status = "Created" if created else "Existing"
    print(f"[{status}] {comm.name} ({comm.specialty_tag})")
    
    if not comm.posts.filter(title=post_info['title']).exists():
        CommunityPost.objects.create(
            community=comm,
            author_alias=post_info['author_alias'],
            title=post_info['title'],
            content=post_info['content'],
            likes_count=4
        )
        print(f"   -> Seeded discussion: '{post_info['title']}' by {post_info['author_alias']}")

print("\nDone! All support groups added successfully.")
