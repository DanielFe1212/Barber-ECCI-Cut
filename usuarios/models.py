from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('cliente', 'Cliente'),
        ('barbero', 'Barbero'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='cliente')
    foto_perfil = models.ImageField(upload_to='perfiles/', blank=True, null=True)
