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
        serializer = UsuarioSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class FotoPerfilView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Subir o reemplazar foto de perfil."""
        foto = request.FILES.get('foto')
        if not foto:
            return Response({'error': 'No se envió ninguna foto.'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if user.foto_perfil:
            user.foto_perfil.delete(save=False)
        user.foto_perfil = foto
        user.save()
        url = request.build_absolute_uri(user.foto_perfil.url)
        registrar(user, 'editar', 'usuario', user.id, 'Foto de perfil actualizada')
        return Response({'foto_perfil_url': url})

    def delete(self, request):
        """Quitar foto de perfil."""
        user = request.user
        if user.foto_perfil:
            user.foto_perfil.delete(save=False)
            user.foto_perfil = None
            user.save()
        registrar(user, 'editar', 'usuario', user.id, 'Foto de perfil eliminada')
        return Response({'mensaje': 'Foto de perfil eliminada.'})


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

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


class EliminarUsuarioView(generics.DestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdmin]

    def perform_destroy(self, instance):
        registrar(self.request.user, 'eliminar', 'usuario', instance.id, f'Usuario eliminado: {instance.username}')
        instance.delete()
