from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    follows = models.ManyToManyField("User", related_name="followers", blank=True)

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="own_posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField("User", related_name="favorite_posts", blank=True)

    # Make JSON format expression
    def serialize(self, visitor_name):
        visitor_like = False
        if visitor_name != "":
            visitor = User.objects.get(username=visitor_name)
            if visitor in self.likes.all():
                visitor_like = True
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp,
            "likes_num": self.likes.all().count(),
            "visitor_like": visitor_like
        }