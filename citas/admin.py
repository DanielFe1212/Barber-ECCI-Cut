from django.contrib import admin
from .models import Cita

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'barbero', 'fecha', 'hora', 'estado']
    list_filter = ['estado', 'barbero']