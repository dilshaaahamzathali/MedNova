from django.contrib import admin
from .models import HealthArticle

@admin.register(HealthArticle)
class HealthArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author_name', 'status', 'published_date')
    list_filter = ('status', 'category')
    search_fields = ('title', 'author_name')
