# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-11-06 22:38
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('intranet', '0003_document_is_available'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document',
            name='url',
        ),
    ]
