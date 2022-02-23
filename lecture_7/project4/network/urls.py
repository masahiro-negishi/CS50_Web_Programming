
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("following", views.following, name="following"), # Show following page
    path("profile/<str:username>", views.profile, name="profile"), # Show profile page

    path("get_posts/<int:start>", views.get_posts, name="get_posts"), # Get posts start from "start"
    path("get_posts_user/<str:username>/<int:start>", views.get_posts_user, name="get_posts_user"), # Get posts of a particular user start from "start"
    path("get_posts_follows/<int:start>", views.get_posts_follows, name="get_posts_follows"), # Get posts of Follows start from "start"
    path("check_follow/<str:username>", views.check_follow, name="check_follow"), # Check if request.user follows a particular user
    path("follow/<str:username>", views.follow, name="follow"), # Follow a particular user
    path("unfollow/<str:username>", views.unfollow, name="unfollow"), # Unfollow a particular 
    path("save", views.save, name="save"), # Apply change of a post to DB
    path("like", views.like, name="like") # Add Like or Unlike to a post 
]
