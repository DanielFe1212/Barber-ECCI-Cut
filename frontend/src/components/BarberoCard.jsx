const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
];

export default function BarberoCard({ barbero, seleccionado, onSeleccionar }) {
  const colorIndex = barbero.id % AVATAR_COLORS.length;

  return (
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
      {/* Foto o avatar generado */}
      <div style={s.fotoWrap}>
        {barbero.foto_url ? (
          <img src={barbero.foto_url} alt={barbero.nombre} style={s.foto} />
        ) : (
          <div style={{ ...s.avatarFallback, background: AVATAR_COLORS[colorIndex] }}>
            {barbero.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        {seleccionado && <div style={s.checkOverlay}>✓</div>}
      </div>

      {/* Info */}
      <div style={s.info}>
        <p style={s.nombre}>{barbero.nombre}</p>
        <p style={s.especialidad}>✂ {barbero.especialidad}</p>
        {barbero.descripcion && (
          <p style={s.descripcion}>{barbero.descripcion}</p>
        )}
      </div>
    </div>
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
};
