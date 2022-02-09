from django.http.response import HttpResponse
from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from . import util
import random
import markdown2

# Class for New Page
class NewPageForm(forms.Form):
    title = forms.CharField(label="Title")
    content = forms.CharField(label="Content", widget=forms.Textarea)

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, TITLE):
    # Get a markdown corresponding to TITLE
    entry = util.get_entry(TITLE)
    if entry:
        # Requested page exists
        md = markdown2.Markdown()
        html = md.convert(entry)
        return render(request, "encyclopedia/entry.html", {
            "title": TITLE,
            "found": True,
            "entry": html
        })
    else:
        # Request page does not exist
        return render(request, "encyclopedia/entry.html", {
            "title": TITLE,
            "found": False,
        })

def search(request):
    # Receive a query
    word = request.POST['q']
    if util.get_entry(word):
        # Requested page exists
        entry = util.get_entry(word)
        md = markdown2.Markdown()
        html = md.convert(entry)
        return render(request, "encyclopedia/entry.html", {
            "title": word,
            "found": True,
            "entry": html
        })
    else:
        # Request page does not exist
        # List up all the entry names that include word as a substring
        entries = util.list_entries()
        includings = [ent for ent in entries if word in ent]
        return render(request, "encyclopedia/search_results.html", {
            "entry": word,
            "includings": includings
        })

def new(request):
    if request.method == "GET":
        # Page for making a new page
        return render(request, "encyclopedia/new.html", {
            "form": NewPageForm()
        })
    elif request.method == "POST":
        form = NewPageForm(request.POST)
        if form.is_valid():
            # Valid form
            title = form.cleaned_data['title']
            content = form.cleaned_data['content']
            if util.get_entry(title):
                # Page already exists
                return render(request, "encyclopedia/new_error.html", {
                    "title": title,
                })
            else:
                # Save a new page
                util.save_entry(title, content)
                entry = util.get_entry(title)
                md = markdown2.Markdown()
                html = md.convert(entry)
                return render(request, "encyclopedia/entry.html", {
                    "title": title,
                    "found": True,
                    "entry": html
                })
        else:
            # Invalid form
            return render(request, "encyclopedia/new.html", {
                "form": form
            })

def edit(request, TITLE):
    if request.method == "GET":
        # Read present entry
        entry = util.get_entry(TITLE)
        #content = (entry.lstrip(f"# {TITLE}")).lstrip("\n\n")
        return render(request, "encyclopedia/edit.html", {
            "title": TITLE,
            "content": entry
        })
    else:
        # Overwrite entry
        content = request.POST['content']
        util.save_entry(TITLE, content)
        entry = util.get_entry(TITLE)
        md = markdown2.Markdown()
        html = md.convert(entry)
        return render(request, "encyclopedia/entry.html", {
            "title": TITLE,
            "found": True,
            "entry": html
        })

def random_entry(request):
    entries = util.list_entries()
    # Random choice
    title = random.choice(entries)
    entry = util.get_entry(title)
    #content = (entry.lstrip(f"# {title}")).lstrip("\n")
    md = markdown2.Markdown()
    html = md.convert(entry)
    return render(request, "encyclopedia/entry.html", {
        "title": title,
        "found": True,
        "entry": html
    })