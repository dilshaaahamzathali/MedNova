from django.db import models

class HealthArticle(models.Model):
    STATUS_CHOICES = (
        ('PENDING_MODERATION', 'Pending Moderation'),
        ('APPROVED', 'Approved & Published'),
        ('REJECTED', 'Rejected'),
    )

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    author_name = models.CharField(max_length=255)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_MODERATION')
    summary = models.TextField()
    content = models.TextField()
    published_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.author_name} [{self.status}]"
