import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSesionInactiva from '../hooks/useSesionInactiva';
import AvisoSesion from './AvisoSesion';

function WrapperSesion({ children, rol }) {
  const { usuario, logout } = useAuth();
  const [aviso, setAviso] = useState(null); // { segundos }

  const onAviso = useCallback((segundos) => {
    setAviso({ segundos });
  }, []);

  const onCerrar = useCallback(() => {
    setAviso(null);
    logout('/login');
  }, [logout]);

  const { continuarSesion } = useSesionInactiva({
    activo: !!usuario,
    onAviso,
    onCerrar,
  });

  const handleContinuar = () => {
    setAviso(null);
    continuarSesion();
  };

  return (
    <>
      {children}
      {aviso && (
        <AvisoSesion
          segundosRestantes={aviso.segundos}
          onContinuar={handleContinuar}
          onCerrar={onCerrar}
        />
      )}
    </>
  );
}

export function RutaProtegida({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <Cargando />;
  if (!usuario) return <Navigate to="/login" />;
  return <WrapperSesion>{children}</WrapperSesion>;
}

export function RutaAdmin({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <Cargando />;
  if (!usuario) return <Navigate to="/login" />;
  if (usuario.rol !== 'admin') return <Navigate to="/citas" />;
  return <WrapperSesion rol="admin">{children}</WrapperSesion>;
}

export function RutaBarbero({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <Cargando />;
  if (!usuario) return <Navigate to="/login" />;
  if (usuario.rol !== 'barbero') return <Navigate to="/login" />;
  return <WrapperSesion rol="barbero">{children}</WrapperSesion>;
}

export function RutaPublica({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <Cargando />;
  if (usuario) {
    if (usuario.rol === 'admin')   return <Navigate to="/admin" />;
    if (usuario.rol === 'barbero') return <Navigate to="/barbero" />;
    return <Navigate to="/citas" />;
  }
  return children;
}

function Cargando() {
  return (
    <div style={{ textAlign: 'center', marginTop: '40px', color: '#fff', fontFamily: "'Nunito', sans-serif" }}>
      Cargando...
    </div>
  );
}
