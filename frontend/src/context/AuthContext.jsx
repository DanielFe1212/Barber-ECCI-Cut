import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const token = sessionStorage.getItem('access');
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/usuarios/perfil/');
        setUsuario(res.data);
      } catch {
        sessionStorage.removeItem('access');
        sessionStorage.removeItem('refresh');
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, []);

  const login = (userData) => setUsuario(userData);

  const actualizarPerfil = (datos) => setUsuario(prev => ({ ...prev, ...datos }));

  const logout = async (redirectUrl = '/login') => {
    try {
      const refresh = sessionStorage.getItem('refresh');
      if (refresh) await api.post('/usuarios/logout/', { refresh });
    } catch { /* continuar */ } finally {
      setUsuario(null);
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('refresh');
      window.location.href = redirectUrl;
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, actualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
