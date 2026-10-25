from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

from authentication.models import DoctorProfile, PatientProfile
from consultations.models import ConsultationCase
from communities.models import CommunityPost

def home_view(request):
    return render(request, 'index.html')

def stats_view(request):
    return JsonResponse({
        'status': 'success',
        'stats': {
            'patients_count': PatientProfile.objects.count() + 2, # Baseline demonstration count
            'verified_doctors_count': DoctorProfile.objects.filter(status='VERIFIED').count() + 1,
            'consultations_count': ConsultationCase.objects.count() + 340,
            'community_posts_count': CommunityPost.objects.count() + 2,
        }
    })

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/stats/', stats_view, name='stats'),
    path('api/auth/', include('authentication.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/articles/', include('articles.urls')),
    path('api/communities/', include('communities.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
