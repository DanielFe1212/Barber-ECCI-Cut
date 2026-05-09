from .models import AuditLog


def registrar(usuario, accion, entidad, entidad_id=None, detalle=''):
    """Crea un registro de auditoría. Silencia errores para no interrumpir el flujo."""
    try:
        AuditLog.objects.create(
            usuario=usuario,
            accion=accion,
            entidad=entidad,
            entidad_id=entidad_id,
            detalle=detalle,
        )
    except Exception:
        pass
