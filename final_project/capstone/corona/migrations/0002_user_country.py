# Generated by Django 4.0.2 on 2022-02-27 12:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corona', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='country',
            field=models.CharField(default='Japan', max_length=100),
        ),
    ]
