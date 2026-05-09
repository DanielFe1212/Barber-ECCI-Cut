from django.db import models
from django.conf import settings


class Barbero(models.Model):
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='barbero',
        null=True,
        blank=True,
    )
    nombre = models.CharField(max_length=100)
    especialidad = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, default='')
    foto = models.ImageField(upload_to='barberos/', blank=True, null=True)

    def __str__(self):
        return self.nombre


class Horario(models.Model):
    barbero = models.ForeignKey(Barbero, on_delete=models.CASCADE, related_name='horarios')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    disponible = models.BooleanField(default=True)