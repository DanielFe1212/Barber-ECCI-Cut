from rest_framework import viewsets, permissions
from .models import Cita
from .serializers import CitaSerializer

class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admin ve todas las citas, cliente solo las suyas
        if user.rol == 'admin':
            return Cita.objects.all()
        return Cita.objects.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def cancelar(self, request, pk=None):
        cita = self.get_object()
        if cita.usuario != request.user and request.user.rol != 'admin':
            return Response({"error": "No autorizado."}, status=403)
        cita.estado = 'cancelada'
        cita.save()
        return Response({"mensaje": "Cita cancelada correctamente."})
