from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'usuario_nombre', 'accion', 'entidad', 'entidad_id', 'detalle', 'fecha']
