# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-08 15:56
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0011_auto_20160408_1241'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mendeley_credentials',
            name='state',
        ),
    ]
