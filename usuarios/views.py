from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario
from .serializers import UsuarioSerializer, RegistroSerializer, CrearBarberoSerializer
from .permissions import EsAdmin
from auditoria.utils import registrar


class RegistroView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        usuario = serializer.save()
        registrar(usuario, 'crear', 'usuario', usuario.id, f'Registro de cliente: {usuario.username}')


class CrearBarberoView(APIView):
    permission_classes = [EsAdmin]

    def post(self, request):
        serializer = CrearBarberoSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            registrar(request.user, 'crear', 'usuario', usuario.id, f'Barbero creado: {usuario.username}')
            return Response({'mensaje': 'Barbero creado correctamente.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerfilView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            registrar(request.user, 'logout', 'usuario', request.user.id, 'Cierre de sesión')
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'mensaje': 'Sesión cerrada correctamente.'})
        except Exception:
            return Response({'error': 'Token inválido.'}, status=400)


class ListaUsuariosView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdmin]


class EliminarUsuarioView(generics.DestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdmin]

    def perform_destroy(self, instance):
        registrar(self.request.user, 'eliminar', 'usuario', instance.id, f'Usuario eliminado: {instance.username}')
        instance.delete()
