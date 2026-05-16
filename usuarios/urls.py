from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegistroView, PerfilView, LogoutView,
    ListaUsuariosView, CrearBarberoView, EliminarUsuarioView,
    FotoPerfilView,
)

urlpatterns = [
    path('registro/',       RegistroView.as_view(),       name='registro'),
    path('login/',          TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/',  TokenRefreshView.as_view(),    name='token_refresh'),
    path('perfil/',         PerfilView.as_view(),          name='perfil'),
    path('perfil/foto/',    FotoPerfilView.as_view(),      name='foto_perfil'),
    path('logout/',         LogoutView.as_view(),          name='logout'),
    path('crear-barbero/',  CrearBarberoView.as_view(),    name='crear_barbero'),
    path('<int:pk>/',       EliminarUsuarioView.as_view(), name='eliminar_usuario'),
    path('',                ListaUsuariosView.as_view(),   name='lista_usuarios'),
]
