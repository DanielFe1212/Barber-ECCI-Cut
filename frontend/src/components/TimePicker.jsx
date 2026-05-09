import { useState, useRef, useEffect } from 'react';

const HORAS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export default function TimePicker({ label, value, onChange, required }) {
  const [abierto, setAbierto] = useState(false);
  const [hora, setHora] = useState(value ? value.split(':')[0] : '08');
  const [min,  setMin]  = useState(value ? value.split(':')[1]?.slice(0,2) : '00');
  const ref = useRef(null);

  // Sincronizar si el padre cambia el valor
  useEffect(() => {
    if (value) {
      setHora(value.split(':')[0]);
      setMin(value.split(':')[1]?.slice(0,2) || '00');
    }
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const seleccionar = (h, m) => {
    setHora(h); setMin(m);
    onChange(`${h}:${m}`);
    setAbierto(false);
  };

  const displayValue = value ? `${hora}:${min}` : 'Seleccionar';

  return (
    <div style={s.wrap} ref={ref}>
      {label && <label style={s.label}>{label}</label>}
      <button type="button" style={s.trigger} onClick={() => setAbierto(!abierto)}>
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.4)' }}>🕐 {displayValue}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{abierto ? '▲' : '▼'}</span>
      </button>
      {required && <input type="text" value={value || ''} onChange={() => {}} required style={{ display: 'none' }} />}

      {abierto && (
        <div style={s.panel}>
          <div style={s.columnas}>
            {/* Horas */}
            <div style={s.col}>
              <p style={s.colTitulo}>Hora</p>
              <div style={s.scroll}>
                {HORAS.map(h => (
                  <button
                    key={h} type="button"
                    style={{ ...s.item, background: hora === h ? 'rgba(255,255,255,0.25)' : 'transparent', fontWeight: hora === h ? '800' : '400' }}
                    onClick={() => { setHora(h); onChange(`${h}:${min}`); }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            {/* Minutos */}
            <div style={s.col}>
              <p style={s.colTitulo}>Min</p>
              <div style={s.scroll}>
                {MINUTOS.map(m => (
                  <button
                    key={m} type="button"
                    style={{ ...s.item, background: min === m ? 'rgba(255,255,255,0.25)' : 'transparent', fontWeight: min === m ? '800' : '400' }}
                    onClick={() => seleccionar(hora, m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" style={s.btnConfirmar} onClick={() => seleccionar(hora, min)}>
            Confirmar {hora}:{min}
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  trigger: {
    padding: '11px 14px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
    color: '#fff', fontSize: '14px', cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  panel: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: 'rgba(10,50,80,0.97)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
    padding: '16px', zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  columnas: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  col: { display: 'flex', flexDirection: 'column', gap: '6px' },
  colTitulo: {
    fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0,
  },
  scroll: {
    maxHeight: '160px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '2px',
  },
  item: {
    padding: '8px 10px', borderRadius: '8px', border: 'none',
    color: '#fff', fontSize: '14px', cursor: 'pointer', textAlign: 'center',
    fontFamily: "'Nunito', sans-serif", transition: 'background 0.1s',
  },
  btnConfirmar: {
    width: '100%', padding: '10px',
    background: 'rgba(255,255,255,0.9)', border: 'none',
    borderRadius: '10px', color: '#0a4f7a',
    fontSize: '14px', fontWeight: '800', cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
};
