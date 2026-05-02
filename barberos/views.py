from rest_framework import viewsets, permissions
from .models import Barbero, Horario
from .serializers import BarberoSerializer, HorarioSerializer
from usuarios.permissions import EsAdmin, EsAdminOBarbero


class BarberoViewSet(viewsets.ModelViewSet):
    queryset = Barbero.objects.all()
    serializer_class = BarberoSerializer

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsAdmin()]
        return [permissions.IsAuthenticated()]


class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsAdminOBarbero()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Horario.objects.all()
        barbero_id = self.request.query_params.get('barbero')
        disponible = self.request.query_params.get('disponible')
        if barbero_id:
            queryset = queryset.filter(barbero_id=barbero_id)
        if disponible:
            queryset = queryset.filter(disponible=disponible)
        return queryset
