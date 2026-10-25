from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import HealthArticle

@csrf_exempt
def list_articles(request):
    """Returns approved & published health articles for public view."""
    articles_qs = HealthArticle.objects.filter(status='APPROVED').order_by('-published_date')
    articles = []
    for a in articles_qs:
        articles.append({
            'id': a.id,
            'title': a.title,
            'category': a.category,
            'author_name': a.author_name,
            'summary': a.summary,
            'content': a.content,
            'published_date': a.published_date.strftime('%b %d, %Y'),
            'status': a.status
        })
    return JsonResponse({'status': 'success', 'articles': articles})

@csrf_exempt
def list_all_articles_admin(request):
    """Admin: Returns all articles including pending/rejected."""
    articles_qs = HealthArticle.objects.all().order_by('-published_date')
    articles = []
    for a in articles_qs:
        articles.append({
            'id': a.id,
            'title': a.title,
            'category': a.category,
            'author_name': a.author_name,
            'summary': a.summary,
            'published_date': a.published_date.strftime('%b %d, %Y'),
            'status': a.status
        })
    return JsonResponse({'status': 'success', 'articles': articles})

@csrf_exempt
def create_article(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        art = HealthArticle.objects.create(
            title=data.get('title'),
            category=data.get('category'),
            author_name=data.get('author_name', 'Verified Doctor'),
            summary=data.get('summary'),
            content=data.get('content'),
            status='PENDING_MODERATION'
        )
        return JsonResponse({'status': 'success', 'article_id': art.id, 'message': 'Article submitted for moderation.'})
    return JsonResponse({'error': 'POST method required'}, status=400)

@csrf_exempt
def approve_article(request, article_id):
    """Admin: Approve or reject a health article."""
    if request.method == 'POST':
        action = request.GET.get('action', 'approve')
        try:
            article = HealthArticle.objects.get(id=article_id)
            if action == 'approve':
                article.status = 'APPROVED'
                article.save()
                return JsonResponse({'status': 'success', 'message': f'Article "{article.title}" approved and published.'})
            else:
                article.status = 'REJECTED'
                article.save()
                return JsonResponse({'status': 'success', 'message': f'Article "{article.title}" rejected.'})
        except HealthArticle.DoesNotExist:
            return JsonResponse({'error': 'Article not found'}, status=404)
    return JsonResponse({'error': 'POST method required'}, status=400)
