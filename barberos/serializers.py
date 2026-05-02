from rest_framework import serializers
from .models import Barbero, Horario


class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'


class BarberoSerializer(serializers.ModelSerializer):
    horarios = HorarioSerializer(many=True, read_only=True)
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Barbero
        fields = ['id', 'nombre', 'especialidad', 'descripcion', 'foto', 'foto_url', 'horarios']
        extra_kwargs = {'foto': {'write_only': True}}

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
            return obj.foto.url
        return None
