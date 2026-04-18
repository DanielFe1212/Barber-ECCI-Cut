from rest_framework import serializers
from .models import Barbero, Horario

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'

class BarberoSerializer(serializers.ModelSerializer):
    horarios = HorarioSerializer(many=True, read_only=True)

    class Meta:
        model = Barbero
        fields = ['id', 'nombre', 'especialidad', 'horarios']