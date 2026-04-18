from rest_framework import viewsets, permissions
from .models import Barbero, Horario
from .serializers import BarberoSerializer, HorarioSerializer

class BarberoViewSet(viewsets.ModelViewSet):
    queryset = Barbero.objects.all()
    serializer_class = BarberoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Horario.objects.all()
        barbero_id = self.request.query_params.get('barbero')
        disponible = self.request.query_params.get('disponible')

        if barbero_id:
            queryset = queryset.filter(barbero_id=barbero_id)
        if disponible:
            queryset = queryset.filter(disponible=disponible)
        return queryset
