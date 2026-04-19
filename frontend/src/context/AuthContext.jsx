import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        setLoading(false);
        return;
      }
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
  }, []);

  const login = (userData) => setUsuario(userData);
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);