# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-10-26 23:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('intranet', '0002_auto_20161026_0235'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='is_available',
            field=models.BooleanField(default=False),
        ),
    ]