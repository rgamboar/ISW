# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-11-07 00:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0002_auto_20161026_0235'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='last_activity',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
