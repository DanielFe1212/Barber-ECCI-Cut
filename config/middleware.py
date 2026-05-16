import time
from django.conf import settings
from django.contrib.auth import logout

# Timestamp de cuando arrancó el servidor — se regenera con cada reinicio
SERVER_START_TIME = time.time()


class InvalidarSesionesAntiguas:
    """
    Invalida sesiones del admin de Django creadas antes del último reinicio
    del servidor. Así, al reiniciar, todos los usuarios del admin deben
    volver a autenticarse.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.path.startswith('/admin/'):
            inicio_sesion = request.session.get('_session_start_time')
            if inicio_sesion is None:
                # Primera request de esta sesión — guardar timestamp
                request.session['_session_start_time'] = time.time()
            elif inicio_sesion < SERVER_START_TIME:
                # Sesión anterior al reinicio del servidor — invalidar
                logout(request)
                from django.shortcuts import redirect
                return redirect('/admin/login/?next=/admin/')
        return self.get_response(request)
