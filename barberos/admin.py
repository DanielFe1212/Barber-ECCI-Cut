from django.contrib import admin
from .models import Barbero, Horario

@admin.register(Barbero)
class BarberoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'especialidad']

@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = ['barbero', 'fecha', 'hora_inicio', 'hora_fin', 'disponible']
    list_filter = ['disponible', 'barbero']
