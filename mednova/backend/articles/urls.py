from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_articles, name='list_articles'),
    path('create/', views.create_article, name='create_article'),
    path('admin/all/', views.list_all_articles_admin, name='list_all_articles_admin'),
    path('admin/<int:article_id>/moderate/', views.approve_article, name='approve_article'),
]
