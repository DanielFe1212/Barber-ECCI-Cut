from rest_framework import generics, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from usuarios.permissions import EsAdmin


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [EsAdmin]

    def get_queryset(self):
        queryset = AuditLog.objects.all()[:200]
        entidad = self.request.query_params.get('entidad')
        if entidad:
            queryset = AuditLog.objects.filter(entidad=entidad)[:200]
        return queryset
