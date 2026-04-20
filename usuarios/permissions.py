from rest_framework.permissions import BasePermission

class EsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'admin'

class EsCliente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'cliente'

class EsBarbero(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'barbero'

class EsAdminOCliente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ['admin', 'cliente']

class EsAdminOBarbero(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol in ['admin', 'barbero']