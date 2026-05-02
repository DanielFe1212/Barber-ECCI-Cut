from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('barberos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='barbero',
            name='descripcion',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='barbero',
            name='foto',
            field=models.ImageField(blank=True, null=True, upload_to='barberos/'),
        ),
    ]
