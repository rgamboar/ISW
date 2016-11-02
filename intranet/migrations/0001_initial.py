# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-11-02 05:03
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('login', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document', models.FileField(max_length=500, upload_to='uploads/documents/')),
                ('type', models.BooleanField()),
                ('title', models.CharField(max_length=300, null=True)),
                ('author', models.CharField(max_length=300, null=True)),
                ('date', models.DateField(null=True)),
                ('abstract', models.CharField(max_length=1000, null=True)),
                ('date_added', models.DateField(auto_now_add=True)),
                ('drive_id', models.CharField(max_length=100, null=True)),
                ('thumbnail', models.FileField(max_length=500, upload_to='static/thumbnails/')),
                ('words', models.CharField(max_length=200, null=True)),
                ('issn', models.CharField(max_length=20, null=True)),
                ('doi', models.CharField(max_length=50, null=True)),
                ('url', models.CharField(max_length=50, null=True)),
                ('pages', models.CharField(max_length=25, null=True)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='login.Area')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
