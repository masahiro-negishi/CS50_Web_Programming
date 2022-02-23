from django.test import TestCase
from .models import User, Post

# Create your tests here.
class PostTestCase(TestCase):

    def setUp(self):

        # Create User
        u1 = User.objects.create(username='harry', password='harrypotter12345')
        u2 = User.objects.create(username='ron', password='ronweasley12345')

        # Create Post
        for i in range(10):
            Post.objects.create(user=u1, body=f'#{2*i} posted by u1')
            Post.objects.create(user=u2, body=f'#{2*i+1} posted by u2')

    def test_own_posts(self):
        u1 = User.objects.get(username='harry')
        self.assertEqual(u1.own_posts.count(), Post.objects.filter(user=u1).count())
        u2 = User.objects.get(username='ron')
        self.assertEqual(u2.own_posts.count(), Post.objects.filter(user=u2).count())