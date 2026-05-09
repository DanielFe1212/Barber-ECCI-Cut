from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    ACCIONES = [
        ('crear', 'Crear'),
        ('editar', 'Editar'),
        ('eliminar', 'Eliminar'),
        ('cancelar', 'Cancelar'),
        ('completar', 'Completar'),
        ('login', 'Inicio de sesión'),
        ('logout', 'Cierre de sesión'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='auditorias',
    )
    accion = models.CharField(max_length=20, choices=ACCIONES)
    entidad = models.CharField(max_length=50)   # 'cita', 'barbero', 'usuario', 'horario'
    entidad_id = models.IntegerField(null=True, blank=True)
    detalle = models.TextField(blank=True, default='')
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.usuario} — {self.accion} {self.entidad} #{self.entidad_id}'
