# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-07 01:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0018_auto_20160506_2011'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='drive_code',
            field=models.CharField(max_length=100, null=True),
        ),
    ]