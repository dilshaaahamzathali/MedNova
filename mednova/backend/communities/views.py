from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User
from .models import Community, CommunityPost, CommunityReply
from mednova.crypto_utils import generate_anonymous_alias
from authentication.models import SecurityAuditLog

def check_patient_authorized(request):
    """
    Validates whether the incoming request is made by a registered patient (or admin).
    Accepts Django session authentication or X-User-Id / X-User-Role headers / query params.
    """
    if request.user.is_authenticated:
        if hasattr(request.user, 'patient_profile') or request.user.is_superuser or request.user.is_staff or hasattr(request.user, 'doctor_profile'):
            return True, getattr(request.user, 'patient_profile', None)

    user_id = request.headers.get('X-User-Id') or request.GET.get('user_id')
    if user_id:
        try:
            u = User.objects.get(id=user_id)
            if hasattr(u, 'patient_profile') or u.is_superuser or u.is_staff or hasattr(u, 'doctor_profile'):
                return True, getattr(u, 'patient_profile', None)
        except (User.DoesNotExist, ValueError):
            pass

    return False, None

@csrf_exempt
def list_communities(request):
    communities = []
    for c in Community.objects.all():
        communities.append({
            'id': c.id,
            'name': c.name,
            'slug': c.slug,
            'specialty_tag': c.specialty_tag,
            'description': c.description,
            'icon': c.icon,
            'posts_count': c.posts.count(),
        })
    return JsonResponse({'status': 'success', 'communities': communities})

@csrf_exempt
def get_community_posts(request, slug):
    authorized, patient = check_patient_authorized(request)
    if not authorized:
        return JsonResponse({
            'status': 'error',
            'code': 'PATIENT_AUTH_REQUIRED',
            'error': 'Access restricted. Only registered patients can view community support group discussions.'
        }, status=403)

    try:
        community = Community.objects.get(slug=slug)
        posts = []
        for p in community.posts.all():
            replies = [{
                'id': r.id,
                'author_alias': r.author_alias,
                'content': r.content,
                'created_at': r.created_at.strftime('%b %d, %Y %H:%M')
            } for r in p.replies.all()]
            posts.append({
                'id': p.id,
                'author_alias': p.author_alias,
                'title': p.title,
                'content': p.content,
                'created_at': p.created_at.strftime('%b %d, %Y %H:%M'),
                'likes_count': p.likes_count,
                'replies': replies,
            })
        return JsonResponse({
            'status': 'success',
            'community': {
                'name': community.name,
                'specialty_tag': community.specialty_tag,
                'description': community.description,
                'slug': community.slug
            },
            'posts': posts
        })
    except Community.DoesNotExist:
        return JsonResponse({'error': 'Community not found'}, status=404)

@csrf_exempt
def create_post(request, slug):
    if request.method == 'POST':
        authorized, patient = check_patient_authorized(request)
        if not authorized:
            return JsonResponse({
                'status': 'error',
                'code': 'PATIENT_AUTH_REQUIRED',
                'error': 'Access restricted. Only registered patients can post in disease support groups.'
            }, status=403)

        try:
            data = json.loads(request.body)
            community = Community.objects.get(slug=slug)
            
            author_alias = data.get('author_alias')
            if not author_alias:
                if patient:
                    author_alias = patient.display_alias
                else:
                    author_alias = generate_anonymous_alias()
                
            post = CommunityPost.objects.create(
                community=community,
                author_alias=author_alias,
                title=data.get('title', 'Health Discussion'),
                content=data.get('content', '')
            )
            
            SecurityAuditLog.objects.create(
                event_type='COMMUNITY_POST',
                actor=author_alias,
                description=f"Anonymous post created in {community.name}: '{post.title[:30]}...'"
            )
            
            return JsonResponse({
                'status': 'success',
                'post_id': post.id,
                'author_alias': post.author_alias,
                'message': 'Post published anonymously to support group.'
            })
        except Community.DoesNotExist:
            return JsonResponse({'error': 'Community not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def like_post(request, post_id):
    if request.method == 'POST':
        authorized, patient = check_patient_authorized(request)
        if not authorized:
            return JsonResponse({
                'status': 'error',
                'code': 'PATIENT_AUTH_REQUIRED',
                'error': 'Access restricted. Only registered patients can interact with support groups.'
            }, status=403)

        try:
            post = CommunityPost.objects.get(id=post_id)
            post.likes_count += 1
            post.save()
            return JsonResponse({'status': 'success', 'likes_count': post.likes_count})
        except CommunityPost.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def add_reply(request, post_id):
    if request.method == 'POST':
        authorized, patient = check_patient_authorized(request)
        if not authorized:
            return JsonResponse({
                'status': 'error',
                'code': 'PATIENT_AUTH_REQUIRED',
                'error': 'Access restricted. Only registered patients can reply in support groups.'
            }, status=403)

        try:
            data = json.loads(request.body)
            post = CommunityPost.objects.get(id=post_id)
            author_alias = data.get('author_alias')
            if not author_alias:
                if patient:
                    author_alias = patient.display_alias
                else:
                    author_alias = generate_anonymous_alias()
            content = data.get('content', '').strip()
            
            if not content:
                return JsonResponse({'error': 'Reply content cannot be empty'}, status=400)
                
            reply = CommunityReply.objects.create(
                post=post,
                author_alias=author_alias,
                content=content
            )
            
            return JsonResponse({
                'status': 'success',
                'reply': {
                    'id': reply.id,
                    'author_alias': reply.author_alias,
                    'content': reply.content,
                    'created_at': reply.created_at.strftime('%b %d, %Y %H:%M')
                }
            })
        except CommunityPost.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def list_all_posts(request):
    """Admin endpoint to monitor and moderate all community groups (Slide 9 DFD 1.1)"""
    posts = []
    for p in CommunityPost.objects.all().select_related('community'):
        posts.append({
            'id': p.id,
            'community_name': p.community.name,
            'specialty_tag': p.community.specialty_tag,
            'author_alias': p.author_alias,
            'title': p.title,
            'content': p.content,
            'created_at': p.created_at.strftime('%Y-%m-%d %H:%M'),
            'likes_count': p.likes_count,
            'replies_count': p.replies.count()
        })
    return JsonResponse({'status': 'success', 'posts': posts})

@csrf_exempt
def delete_post(request, post_id):
    """Admin endpoint to remove inappropriate posts (Slide 9 DFD 1.1)"""
    if request.method == 'POST':
        try:
            post = CommunityPost.objects.get(id=post_id)
            title = post.title
            post.delete()
            SecurityAuditLog.objects.create(
                event_type='ADMIN_POST_MODERATION',
                actor='Admin',
                description=f"Admin removed community post: '{title[:40]}'"
            )
            return JsonResponse({'status': 'success', 'message': 'Post removed by moderator.'})
        except CommunityPost.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
    return JsonResponse({'error': 'POST method required'}, status=400)
