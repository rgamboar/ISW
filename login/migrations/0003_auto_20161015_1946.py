# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-10-15 22:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0002_auto_20161013_1827'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_registered',
            field=models.BinaryField(default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
