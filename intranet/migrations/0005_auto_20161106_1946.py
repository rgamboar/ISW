# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-11-06 22:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('intranet', '0004_remove_document_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='date_added',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
