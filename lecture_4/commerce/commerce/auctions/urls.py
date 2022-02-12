from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create, name="create"), # Create a new listing
    path("watchlist", views.watchlist, name="watchlist"), # Watchlist
    path("categories", views.categories, name="categories"), # All categories
    path("categories/<str:category>", views.one_category, name="one_category"), # Specific category
    path("<str:title>", views.listing, name='listing') # A page specific to a certain listing
]
