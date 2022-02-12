from django.contrib import admin
from.models import User, Bid, Comment, Listing

# Register your models here.

class BidAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        price = obj.price
        listing = obj.listing
        listing.current_price = price
        listing.save()
        obj.save()

    def delete_model(self, request, obj):
        price = obj.price
        listing = obj.listing
        obj.delete()
        bid_history = listing.bids.all().order_by("pk")
        if bid_history.exists():
            listing.current_price = bid_history.last().price
        else:
            listing.current_price = listing.start_price
        listing.save()


admin.site.register(User)
admin.site.register(Bid, BidAdmin)
admin.site.register(Comment)
admin.site.register(Listing)