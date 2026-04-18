
from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('cliente', 'Cliente'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='cliente')

# Create your models here.
