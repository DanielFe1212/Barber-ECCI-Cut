import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RutaProtegida({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Cargando...</p>;
  if (!usuario) return <Navigate to="/login" />;

  return children;
}

export function RutaAdmin({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Cargando...</p>;
  if (!usuario) return <Navigate to="/login" />;
  if (usuario.rol !== 'admin') return <Navigate to="/citas" />;

  return children;
}

export function RutaPublica({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Cargando...</p>;
  if (usuario) return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/citas'} />;

  return children;
}