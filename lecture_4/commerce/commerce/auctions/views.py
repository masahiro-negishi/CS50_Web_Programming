from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from .models import User, Listing, Bid, Comment
from decimal import Decimal
from django.contrib.auth.decorators import login_required

# Class for a new listing
class NewListingForm(forms.Form):
    title = forms.CharField(label="Title", max_length=64)
    description = forms.CharField(label="Description", max_length=1024, widget=forms.Textarea)
    start_bid = forms.DecimalField(label="Start Bid", min_value=0.01, max_digits=10, decimal_places=2)
    image_url = forms.URLField(label="Image_url", required=False)
    category = forms.CharField(label="Category", max_length=64, required=False)

# Class for a new comment
class NewCommentForm(forms.Form):
    text = forms.CharField(label="Description", max_length=1024, widget=forms.Textarea)


def index(request):
    listings = Listing.objects.values('title', 'description', 'current_price', 'image_url', 'active')
    return render(request, "auctions/index.html", {
        "listings" : listings,
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

def create(request):
    if request.method == "POST":
        # Recieve form
        form = NewListingForm(request.POST)
        if form.is_valid():
            # Save the new listing
            title = form.cleaned_data['title']
            description = form.cleaned_data['description']
            start_bid = form.cleaned_data['start_bid']
            image_url = form.cleaned_data['image_url']
            category = form.cleaned_data['category']
            newlist = Listing.objects.create(title=title, description=description, image_url=image_url, category=category, seller=request.user, current_price=start_bid, start_price=start_bid, active=True)
            # Redirect to Listing page
            return HttpResponseRedirect(reverse("listing", args=[f"{title}"]))
        else:
            # Invalid form
            return render(request, "auctions/create.html", {
                "message" : "Invalid form",
                "form" : form 
            })
    else:
        # Show input form
        return render(request, "auctions/create.html", {
            "form" : NewListingForm() 
        })

def listing(request, title):
    listing = Listing.objects.get(title=title)
    comments = listing.comments.all().order_by("pk")
    bids = listing.bids.all().order_by("pk")
    bid_history = listing.bids.all().order_by("pk")
    in_watchlist = request.user in listing.users_interested.all()
    if request.method == "POST":
        action = request.POST["action"]
        if action == "Add_to_watchlist":
            # Add to watchlist 
            listing.users_interested.add(request.user)
            return render(request, "auctions/listing.html", {
                "message" : "Result: Added this listing to your watchlist",
                "listing" : listing,
                "comments" : comments,
                "bids" : bids,
                "in_watchlist" : True,
                "bid_history" : bid_history.exists(),
                "form" : NewCommentForm()
            })
        elif action == "Remove_from_watchlist":
            # Remove from watchlist
            listing.users_interested.remove(request.user)
            return render(request, "auctions/listing.html", {
                "message" : "Result: Removed this listing from your watchlist",
                "listing" : listing,
                "comments" : comments,
                "bids" : bids,
                "in_watchlist" : False,
                "bid_history" : bid_history.exists(),
                "form" : NewCommentForm()
            })
        elif action == "Bid":
            # Add bid
            price = Decimal(request.POST["bid"])
            if bid_history.exists():
                # There are previous bids
                if price <= listing.current_price:
                    # Invalid bid
                    return render(request, "auctions/listing.html", {
                        "message" : "Error: New bid must be higher than current bid",
                        "listing" : listing,
                        "comments" : comments,
                        "bids" : bids,
                        "in_watchlist" : in_watchlist,
                        "bid_history" : True,
                        "form" : NewCommentForm()
                    })
                else:
                    # Valid bid
                    Bid.objects.create(price=price, buyer=request.user, listing=listing)
                    listing.current_price = price
                    listing.save()
                    return render(request, "auctions/listing.html", {
                        "message" : "Result: Added bid",
                        "listing" : listing,
                        "comments" : comments,
                        "bids" : bids,
                        "in_watchlist" : in_watchlist,
                        "bid_history" : True,
                        "form" : NewCommentForm()
                    })
            else:
                # First bid
                if price < listing.current_price:
                    # Invalid bid
                    return render(request, "auctions/listing.html", {
                        "message" : "Error: First bid must be at least as large as Start bid",
                        "listing" : listing,
                        "comments" : comments,
                        "bids" : bids,
                        "in_watchlist" : in_watchlist,
                        "bid_history" : False
                    })
                else:
                    # Valid bid
                    Bid.objects.create(price=price, buyer=request.user, listing=listing)
                    listing.current_price = price
                    listing.save()
                    return render(request, "auctions/listing.html", {
                        "message" : "Result: Added bid",
                        "listing" : listing,
                        "comments" : comments,
                        "bids" : bids,
                        "in_watchlist" : in_watchlist,
                        "bid_history" : True
                    })
        elif action == "Close":
            listing.active = False
            if bid_history.exists():
                last = bid_history.last().buyer
                listing.winner = last
            listing.save()
            return render(request, "auctions/listing.html", {
                "listing" : listing,
            })
        elif action == "Comment":
            form = NewCommentForm(request.POST)
            if form.is_valid():
                # Save the new comment
                text = form.cleaned_data["text"]
                Comment.objects.create(text=text, listing=listing)
                return render(request, "auctions/listing.html", {
                    "message" : "Added new comments",
                    "listing" : listing,
                    "comments" : listing.comments.all().order_by("pk"),
                    "bids" : bids,
                    "in_watchlist" : in_watchlist,
                    "bid_history" : bid_history.exists(),
                    "form" : NewCommentForm()
                })
            else: 
                # Invalid form
                return render(request, "auctions/listing.html", {
                    "message" : "Invalid comment",
                    "listing" : listing,
                    "comments" : comments,
                    "bids" : bids,
                    "in_watchlist" : in_watchlist,
                    "bid_history" : bid_history.exists(),
                    "form" : NewCommentForm()
                })

    else:
        return render(request, "auctions/listing.html", {
            "listing" : listing,
            "comments" : comments,
            "bids" : bids,
            "in_watchlist" : in_watchlist,
            "bid_history" : bid_history.exists(),
            "form" : NewCommentForm()
        })

def watchlist(request):
    listings = request.user.watchlist.values('title', 'description', 'current_price', 'image_url', 'active')
    return render(request, "auctions/watchlist.html", {
        "listings" : listings
    })

def categories(request):
    categories = Listing.objects.all().values_list("category", flat=True).order_by("category").distinct()
    return render(request, "auctions/categories.html", {
        "categories" : categories
    })

def one_category(request, category):
    listings = Listing.objects.filter(category=category).values('title', 'description', 'current_price', 'image_url', 'active')
    return render(request, "auctions/one_category.html", {
        "listings" : listings,
        "category" : category
    })