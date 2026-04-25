import { useEffect } from 'react';

export default function Toast({ mensaje, tipo = 'exito', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colores = {
    exito: {
      bg: 'rgba(100,255,180,0.15)',
      border: 'rgba(100,255,180,0.4)',
      color: '#6fffc0',
      icono: '✓',
    },
    error: {
      bg: 'rgba(255,100,100,0.15)',
      border: 'rgba(255,100,100,0.4)',
      color: '#ffaaaa',
      icono: '✕',
    },
    info: {
      bg: 'rgba(100,180,255,0.15)',
      border: 'rgba(100,180,255,0.4)',
      color: '#aad4ff',
      icono: 'ℹ',
    },
  };

  const c = colores[tipo];

  return (
    <div style={{...s.toast, background: c.bg, border: `1px solid ${c.border}`}}>
      <span style={{...s.icono, color: c.color}}>{c.icono}</span>
      <span style={{...s.mensaje, color: c.color}}>{mensaje}</span>
      <button style={{...s.cerrar, color: c.color}} onClick={onClose}>✕</button>
    </div>
  );
}

const s = {
  toast: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    borderRadius: '14px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    zIndex: 9999,
    fontFamily: "'Nunito', sans-serif",
    fontSize: '14px',
    fontWeight: '700',
    animation: 'slideIn 0.3s ease',
    minWidth: '260px',
    maxWidth: '380px',
  },
  icono: {
    fontSize: '18px',
    fontWeight: '800',
    flexShrink: 0,
  },
  mensaje: {
    flex: 1,
    lineHeight: '1.4',
  },
  cerrar: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '800',
    padding: '0',
    flexShrink: 0,
    fontFamily: "'Nunito', sans-serif",
  },
};