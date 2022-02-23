from http.client import REQUESTED_RANGE_NOT_SATISFIABLE
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from .models import User, Post
import json
from django.contrib.auth.decorators import login_required


def index(request):
    # Add new post 
    if request.method == "POST":
        user = request.user
        body = request.POST['body']
        post = Post.objects.create(user=user, body=body)

    # Show all the posts
    visitor = request.user.username
    return render(request, "network/index.html", {
        "visitor": visitor
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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def profile(request, username):
    user = User.objects.get(username=username)
    visitor = request.user.username
    follows = user.follows.count()
    followers = user.followers.count()
    return render(request, "network/profile.html", {
        "username": username,
        "visitor": visitor,
        "follows": follows,
        "followers": followers
    })

@login_required(login_url='/login')
def following(request):
    return render(request, "network/following.html")


@require_GET
def get_posts(request, start):
    # Get all posts in reverse chronological order
    posts = Post.objects.all().order_by("-timestamp").all()
    num = len(posts)
    if start > num - 1:
        # No more posts
        return JsonResponse({"error": "No more posts"}, status=400)
    else:
        # Send up to 10 posts
        end = min(start + 10, num)
        return JsonResponse([post.serialize(request.user.username) for post in posts[start:end]], safe=False)


@require_GET
def get_posts_user(request, username, start):
    # Get all posts in reverse chronological order
    user = User.objects.get(username=username)
    posts = Post.objects.filter(user=user).order_by("-timestamp").all()
    print(posts)
    num = len(posts)
    print(num)
    if start > num - 1:
        # No more posts
        return JsonResponse({"error": "No more posts"}, status=400)
    else:
        # Send up to 10 posts
        end = min(start + 10, num)
        return JsonResponse([post.serialize(request.user.username) for post in posts[start:end]], safe=False)


@require_GET
def get_posts_follows(request, start):
    # Get all posts in reverse chronological order
    follows = request.user.follows.all()
    posts = Post.objects.filter(user__in = follows).order_by("-timestamp").all()
    print(posts)
    num = len(posts)
    print(num)
    if start > num - 1:
        # No more posts
        return JsonResponse({"error": "No more posts"}, status=400)
    else:
        # Send up to 10 posts
        end = min(start + 10, num)
        return JsonResponse([post.serialize(request.user.username) for post in posts[start:end]], safe=False)


@require_GET
def check_follow(request, username):
    follows = request.user.follows.all()
    target = User.objects.get(username=username)
    if target in follows:
        return JsonResponse({"follow" : "true"})
    else:
        return JsonResponse({"follow" : "false"})


@require_GET
def follow(request, username):
    follows = request.user.follows.all()
    target = User.objects.get(username=username)
    if target in follows:
        return JsonResponse({"error" : f"{request.user.username} already follows {username}"}, status=400)
    else:
        request.user.follows.add(target)
        return JsonResponse({"message" : "Add to follows successfully"})


@require_GET
def unfollow(request, username):
    follows = request.user.follows.all()
    target = User.objects.get(username=username)
    if target in follows:
        request.user.follows.remove(target)
        return JsonResponse({"message" : "Remove from follows successfully"})
    else:
        request.user.follows.add(target)
        return JsonResponse({"error" : f"{request.user.username} has not follow {username} yet"}, status=400)
 

@require_POST
def save(request):
    data = json.loads(request.body)
    id = data.get('id')
    content = data.get('content')
    post = Post.objects.get(id=id)
    post.body = content
    post.save()
    updated_post = Post.objects.get(id=id)
    return JsonResponse(updated_post.serialize(request.user.username))


@require_POST
def like(request):
    data = json.loads(request.body)
    id = data.get('id')
    like = data.get('like')
    post = Post.objects.get(id=id)
    if like == True:
        post.likes.add(request.user)
    else:
        post.likes.remove(request.user)
    post.save()
    updated_post = Post.objects.get(id=id)
    return JsonResponse(updated_post.serialize(request.user.username))

