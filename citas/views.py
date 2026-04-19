from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cita
from .serializers import CitaSerializer

class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            return Cita.objects.all()
        return Cita.objects.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        cita = self.get_object()
        if cita.usuario != request.user and request.user.rol != 'admin':
            return Response({"error": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)
        if cita.estado == 'cancelada':
            return Response({"error": "La cita ya está cancelada."}, status=status.HTTP_400_BAD_REQUEST)
        cita.estado = 'cancelada'
        cita.save()
        return Response({"mensaje": "Cita cancelada correctamente."})