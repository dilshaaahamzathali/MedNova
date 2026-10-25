from django.contrib import admin
from .models import Community, CommunityPost, CommunityReply

@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty_tag', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'community', 'author_alias', 'created_at', 'likes_count')
    list_filter = ('community',)
    search_fields = ('title', 'content', 'author_alias')

@admin.register(CommunityReply)
class CommunityReplyAdmin(admin.ModelAdmin):
    list_display = ('post', 'author_alias', 'created_at')
