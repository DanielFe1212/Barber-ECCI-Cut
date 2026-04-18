from rest_framework import serializers
from .models import Cita

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'
        read_only_fields = ['usuario']

    def validate(self, data):
        # Verificar que el horario no esté ocupado
        citas_existentes = Cita.objects.filter(
            barbero=data['barbero'],
            fecha=data['fecha'],
            hora=data['hora'],
        ).exclude(estado='cancelada')

        if citas_existentes.exists():
            raise serializers.ValidationError("Este horario ya está ocupado.")
        return data