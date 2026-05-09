import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const SESION_KEY = 'sesion_activa';

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Sesión única: si ya hay una pestaña activa, bloquear
    const sesionPrevia = sessionStorage.getItem(SESION_KEY);
    if (!sesionPrevia) {
      sessionStorage.setItem(SESION_KEY, '1');
    }

    const cargarUsuario = async () => {
      const token = localStorage.getItem('access');
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/usuarios/perfil/');
        setUsuario(res.data);
      } catch {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();

    // Limpiar flag de sesión al cerrar la pestaña
    const handleUnload = () => sessionStorage.removeItem(SESION_KEY);
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const login = (userData) => setUsuario(userData);

  const logout = async (redirectUrl = '/login') => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) await api.post('/usuarios/logout/', { refresh });
    } catch { /* continuar aunque falle */ } finally {
      setUsuario(null);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = redirectUrl;
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
