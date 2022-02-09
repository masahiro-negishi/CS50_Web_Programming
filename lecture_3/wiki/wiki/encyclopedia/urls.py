from django.urls import path

from . import views

app_name = "encyclopedia"
urlpatterns = [
    path("wiki/<str:TITLE>", views.entry, name="entry"), # Entry
    path("", views.index, name="index"), # Index 
    path("search", views.search, name="search"), # Search 
    path("new", views.new, name="new"), # New
    path("wiki/<str:TITLE>/edit", views.edit, name="edit"), # Edit
    path("random", views.random_entry, name="random") #Random
]
