import { useState } from 'react';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
];

export default function BarberoCard({ barbero, seleccionado, onSeleccionar }) {
  const [verFoto, setVerFoto] = useState(false);
  const colorIndex = barbero.id % AVATAR_COLORS.length;

  const handleClickFoto = (e) => {
    e.stopPropagation();
    if (barbero.foto_url) setVerFoto(true);
  };

  return (
    <>
      <div
        style={{
          ...s.card,
          border: seleccionado
            ? '2px solid rgba(255,255,255,0.7)'
            : '1px solid rgba(255,255,255,0.15)',
          boxShadow: seleccionado ? '0 0 0 3px rgba(255,255,255,0.15)' : 'none',
        }}
        onClick={onSeleccionar}
      >
        <div style={s.fotoWrap} onClick={handleClickFoto}>
          {barbero.foto_url ? (
            <img src={barbero.foto_url} alt={barbero.nombre} style={s.foto} />
          ) : (
            <div style={{ ...s.avatarFallback, background: AVATAR_COLORS[colorIndex] }}>
              {barbero.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          {seleccionado && <div style={s.checkOverlay}>✓</div>}
          {barbero.foto_url && !seleccionado && (
            <div style={s.zoomHint}>🔍</div>
          )}
        </div>

        <div style={s.info}>
          <p style={s.nombre}>{barbero.nombre}</p>
          <p style={s.especialidad}>✂ {barbero.especialidad}</p>
          {barbero.descripcion && (
            <p style={s.descripcion}>{barbero.descripcion}</p>
          )}
        </div>
      </div>

      {/* Modal foto completa */}
      {verFoto && (
        <div style={s.modalOverlay} onClick={() => setVerFoto(false)}>
          <div style={s.modalContenido} onClick={(e) => e.stopPropagation()}>
            <img src={barbero.foto_url} alt={barbero.nombre} style={s.fotoCompleta} />
            <div style={s.modalInfo}>
              <p style={s.modalNombre}>{barbero.nombre}</p>
              <p style={s.modalEsp}>✂ {barbero.especialidad}</p>
              {barbero.descripcion && (
                <p style={s.modalDesc}>{barbero.descripcion}</p>
              )}
            </div>
            <button style={s.btnCerrar} onClick={() => setVerFoto(false)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  card: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '18px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'center',
    userSelect: 'none',
  },
  fotoWrap: {
    position: 'relative',
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  foto: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.4)',
  },
  avatarFallback: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    fontWeight: '800',
    color: '#fff',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  checkOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'rgba(46,196,182,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
  },
  zoomHint: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  info: { width: '100%' },
  nombre: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 4px',
  },
  especialidad: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 8px',
    fontWeight: '600',
  },
  descripcion: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
    lineHeight: '1.5',
  },
  // Modal foto completa
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modalContenido: {
    background: 'rgba(10,50,80,0.95)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '420px',
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 16px 64px rgba(0,0,0,0.4)',
  },
  fotoCompleta: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255,255,255,0.4)',
  },
  modalInfo: { textAlign: 'center' },
  modalNombre: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 6px',
  },
  modalEsp: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 12px',
    fontWeight: '600',
  },
  modalDesc: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
    margin: 0,
  },
  btnCerrar: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Nunito', sans-serif",
  },
};
