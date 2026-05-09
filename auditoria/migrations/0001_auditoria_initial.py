from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accion', models.CharField(choices=[('crear', 'Crear'), ('editar', 'Editar'), ('eliminar', 'Eliminar'), ('cancelar', 'Cancelar'), ('completar', 'Completar'), ('login', 'Inicio de sesión'), ('logout', 'Cierre de sesión')], max_length=20)),
                ('entidad', models.CharField(max_length=50)),
                ('entidad_id', models.IntegerField(blank=True, null=True)),
                ('detalle', models.TextField(blank=True, default='')),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('usuario', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='auditorias', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-fecha']},
        ),
    ]
