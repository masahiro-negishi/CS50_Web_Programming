from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Listing(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=1024)
    image_url = models.URLField()
    category = models.CharField(max_length=64)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_sells")
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    start_price = models.DecimalField(max_digits=10, decimal_places=2)
    users_interested = models.ManyToManyField(User, blank=True, related_name="watchlist")
    active = models.BooleanField(default=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="winning", blank=True, null=True)

    def __str__(self):
        return f"{self.title}"

class Bid(models.Model):
    price = models.DecimalField(max_digits=10, decimal_places=2)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_bids")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids")

    def __str__(self):
        return f"${self.price} to {self.listing}"

class Comment(models.Model):
    text = models.CharField(max_length=1024)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="comments")

    def __str__(self):
        return f"comment to {self.listing}"