# Generated by Django 3.0.5 on 2020-05-21 18:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_auto_20200520_2121'),
    ]

    operations = [
        migrations.AddField(
            model_name='experience',
            name='job_title',
            field=models.CharField(blank=True, max_length=400, null=True),
        ),
        migrations.AddField(
            model_name='experience',
            name='location',
            field=models.CharField(blank=True, max_length=400, null=True),
        ),
    ]