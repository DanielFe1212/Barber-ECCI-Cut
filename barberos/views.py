from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
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
    queryset = Horario.objects.all()   # necesario para que el router infiera el basename
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
        if disponible is not None:
            queryset = queryset.filter(disponible=disponible)
        return queryset

    def _verificar_propietario(self, horario):
        user = self.request.user
        if user.rol == 'admin':
            return
        try:
            if horario.barbero.usuario != user:
                raise PermissionDenied('Solo puedes modificar tus propios horarios.')
        except AttributeError:
            raise PermissionDenied('Este horario no está vinculado a tu usuario.')

    def update(self, request, *args, **kwargs):
        self._verificar_propietario(self.get_object())
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._verificar_propietario(self.get_object())
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._verificar_propietario(self.get_object())
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol == 'barbero':
            try:
                barbero = user.barbero
            except Exception:
                raise PermissionDenied('Tu usuario no está vinculado a un barbero.')
            if serializer.validated_data.get('barbero') != barbero:
                raise PermissionDenied('Solo puedes crear horarios para ti mismo.')
        serializer.save()
