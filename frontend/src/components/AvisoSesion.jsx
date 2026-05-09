import { useState, useEffect } from 'react';

export default function AvisoSesion({ segundosRestantes, onContinuar, onCerrar }) {
  const [segundos, setSegundos] = useState(segundosRestantes);

  useEffect(() => {
    setSegundos(segundosRestantes);
    const intervalo = setInterval(() => {
      setSegundos(s => {
        if (s <= 1) { clearInterval(intervalo); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [segundosRestantes]);

  const minutos = Math.floor(segundos / 60);
  const segs    = segundos % 60;
  const tiempo  = `${minutos}:${String(segs).padStart(2, '0')}`;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.icono}>⏱</div>
        <h3 style={s.titulo}>¿Sigues ahí?</h3>
        <p style={s.texto}>
          Tu sesión se cerrará automáticamente por inactividad en
        </p>
        <div style={s.contador}>{tiempo}</div>
        <div style={s.botones}>
          <button style={s.btnCerrar} onClick={onCerrar}>
            Cerrar sesión
          </button>
          <button style={s.btnContinuar} onClick={onContinuar}>
            Continuar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: 'rgba(10,50,80,0.97)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '24px',
    padding: '40px 36px',
    maxWidth: '380px', width: '100%',
    textAlign: 'center',
    boxShadow: '0 16px 64px rgba(0,0,0,0.4)',
    fontFamily: "'Nunito', sans-serif",
  },
  icono: { fontSize: '48px', marginBottom: '12px' },
  titulo: { fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 10px' },
  texto: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: '1.5' },
  contador: {
    fontSize: '42px', fontWeight: '800', color: '#ffe066',
    margin: '0 0 28px',
    textShadow: '0 2px 12px rgba(255,220,100,0.4)',
  },
  botones: { display: 'flex', gap: '12px' },
  btnCerrar: {
    flex: 1, padding: '12px',
    background: 'rgba(255,100,100,0.15)',
    border: '1px solid rgba(255,100,100,0.35)',
    borderRadius: '12px', color: '#ffaaaa',
    fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  btnContinuar: {
    flex: 1, padding: '12px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none', borderRadius: '12px',
    color: '#0a4f7a', fontSize: '14px', fontWeight: '800',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
};
