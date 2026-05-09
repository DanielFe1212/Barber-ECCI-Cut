import { useEffect, useRef, useCallback } from 'react';

const INACTIVIDAD_MS = 5 * 60 * 1000;   // 5 minutos → mostrar aviso
const COUNTDOWN_MS   = 2 * 60 * 1000;   // 2 minutos → cerrar si no responde
const MAX_AVISOS     = 3;                // 3 avisos seguidos → cerrar siempre

export default function useSesionInactiva({ activo, onAviso, onCerrar }) {
  const timerInactividad = useRef(null);
  const timerContdown    = useRef(null);
  const avisosRef        = useRef(0);

  const limpiarTimers = useCallback(() => {
    clearTimeout(timerInactividad.current);
    clearTimeout(timerContdown.current);
  }, []);

  const cerrarSesion = useCallback(() => {
    limpiarTimers();
    avisosRef.current = 0;
    onCerrar();
  }, [limpiarTimers, onCerrar]);

  const iniciarContdown = useCallback(() => {
    timerContdown.current = setTimeout(() => {
      cerrarSesion();
    }, COUNTDOWN_MS);
  }, [cerrarSesion]);

  const mostrarAviso = useCallback(() => {
    avisosRef.current += 1;
    if (avisosRef.current >= MAX_AVISOS) {
      cerrarSesion();
      return;
    }
    onAviso(COUNTDOWN_MS / 1000); // pasa los segundos al componente
    iniciarContdown();
  }, [cerrarSesion, iniciarContdown, onAviso]);

  const reiniciarTimer = useCallback(() => {
    limpiarTimers();
    timerInactividad.current = setTimeout(mostrarAviso, INACTIVIDAD_MS);
  }, [limpiarTimers, mostrarAviso]);

  // Continuar sesión: reinicia contadores
  const continuarSesion = useCallback(() => {
    clearTimeout(timerContdown.current);
    avisosRef.current = 0;
    reiniciarTimer();
  }, [reiniciarTimer]);

  useEffect(() => {
    if (!activo) return;

    const eventos = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const resetear = () => reiniciarTimer();

    eventos.forEach(e => window.addEventListener(e, resetear));
    reiniciarTimer();

    // Cerrar sesión al cerrar la pestaña
    const handleUnload = () => onCerrar();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      limpiarTimers();
      eventos.forEach(e => window.removeEventListener(e, resetear));
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [activo, reiniciarTimer, limpiarTimers, onCerrar]);

  return { continuarSesion };
}
