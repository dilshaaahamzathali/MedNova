from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_communities, name='list_communities'),
    path('all-posts/', views.list_all_posts, name='list_all_posts'),
    path('<slug:slug>/posts/', views.get_community_posts, name='get_community_posts'),
    path('<slug:slug>/create-post/', views.create_post, name='create_post'),
    path('post/<int:post_id>/like/', views.like_post, name='like_post'),
    path('post/<int:post_id>/reply/', views.add_reply, name='add_reply'),
    path('post/<int:post_id>/delete/', views.delete_post, name='delete_post'),
]
