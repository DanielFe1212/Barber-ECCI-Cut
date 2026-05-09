from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cita
from .serializers import CitaSerializer
from usuarios.permissions import EsAdmin, EsAdminOCliente
from auditoria.utils import registrar


class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [EsAdminOCliente()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [EsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            return Cita.objects.all()
        if user.rol == 'barbero':
            try:
                return Cita.objects.filter(barbero=user.barbero)
            except Exception:
                return Cita.objects.none()
        return Cita.objects.filter(usuario=user)

    def perform_create(self, serializer):
        cita = serializer.save(usuario=self.request.user)
        registrar(
            self.request.user, 'crear', 'cita', cita.id,
            f'Cita con barbero #{cita.barbero_id} el {cita.fecha} a las {cita.hora}'
        )

    def perform_destroy(self, instance):
        registrar(
            self.request.user, 'eliminar', 'cita', instance.id,
            f'Cita del {instance.fecha} eliminada'
        )
        instance.delete()

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        cita = self.get_object()
        if cita.usuario != request.user and request.user.rol != 'admin':
            return Response({'error': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        if cita.estado == 'cancelada':
            return Response({'error': 'La cita ya está cancelada.'}, status=status.HTTP_400_BAD_REQUEST)
        cita.estado = 'cancelada'
        cita.save()
        registrar(request.user, 'cancelar', 'cita', cita.id, f'Cita del {cita.fecha} cancelada')
        return Response({'mensaje': 'Cita cancelada correctamente.'})

    @action(detail=True, methods=['patch'])
    def completar(self, request, pk=None):
        cita = self.get_object()
        if request.user.rol not in ['admin', 'barbero']:
            return Response({'error': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        if cita.estado != 'pendiente':
            return Response({'error': 'Solo se pueden completar citas pendientes.'}, status=status.HTTP_400_BAD_REQUEST)
        cita.estado = 'completada'
        cita.save()
        registrar(request.user, 'completar', 'cita', cita.id, f'Cita del {cita.fecha} completada')
        return Response({'mensaje': 'Cita marcada como completada.'})
