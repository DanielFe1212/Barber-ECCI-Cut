import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Citas() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ barbero: '', fecha: '', hora: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
  try {
    const [citasRes, barberosRes, perfilRes] = await Promise.all([
      api.get('/citas/'),
      api.get('/barberos/'),
      api.get('/usuarios/perfil/'),
    ]);
    setCitas(citasRes.data);
    setBarberos(barberosRes.data);
    setPerfil(perfilRes.data);
  } catch (err) {
    setError('Error al cargar los datos.');
  } finally {
    setLoading(false);
  }
};

  const handleAgendar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/citas/', form);
      setMostrarForm(false);
      setForm({ barbero: '', fecha: '', hora: '' });
      cargarDatos();
    } catch (err) {
      setError('Error al agendar la cita. El horario puede estar ocupado.');
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    try {
      await api.post(`/citas/${id}/cancelar/`);
      cargarDatos();
    } catch (err) {
      setError('Error al cancelar la cita.');
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      await api.post('/usuarios/logout/', { refresh });
    } catch (err) {
      console.log('Error al cerrar sesión:', err);
    } finally {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      navigate('/login');
    }
  };

  const estadoColor = (estado) => {
    if (estado === 'pendiente') return { bg: 'rgba(255,220,100,0.2)', color: '#ffe066', border: 'rgba(255,220,100,0.4)' };
    if (estado === 'completada') return { bg: 'rgba(100,255,180,0.2)', color: '#6fffc0', border: 'rgba(100,255,180,0.4)' };
    return { bg: 'rgba(255,100,100,0.2)', color: '#ffaaaa', border: 'rgba(255,100,100,0.4)' };
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
  <div style={s.navBrand}>
    <div style={s.navLogo}>✂</div>
    <span style={s.navTitle}>Barber Ecci Cut</span>
  </div>
  <div style={s.navActions}>
    {perfil && (
      <div style={s.navUser}>
        <div style={s.navAvatar}>
          {perfil.username.charAt(0).toUpperCase()}
        </div>
        <span style={s.navUsername}>Hola, {perfil.username}</span>
      </div>
    )}
    <button style={s.btnNueva} onClick={() => setMostrarForm(true)}>+ Nueva cita</button>
    <button style={s.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
  </div>
</nav>

      <div style={s.contenido}>
        <h2 style={s.titulo}>Mis citas</h2>

        {error && <div style={s.errorBox}>⚠ {error}</div>}

        {/* Modal agendar */}
        {mostrarForm && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h3 style={s.modalTitulo}>Agendar nueva cita</h3>
              <form onSubmit={handleAgendar} style={s.form}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Barbero</label>
                  <select style={s.input} name="barbero" value={form.barbero} onChange={(e) => setForm({...form, barbero: e.target.value})} required>
                    <option value="">Selecciona un barbero</option>
                    {barberos.map((b) => (
                      <option key={b.id} value={b.id}>{b.nombre} — {b.especialidad}</option>
                    ))}
                  </select>
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Fecha</label>
                  <input style={s.input} type="date" value={form.fecha} onChange={(e) => setForm({...form, fecha: e.target.value})} required />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Hora</label>
                  <input style={s.input} type="time" value={form.hora} onChange={(e) => setForm({...form, hora: e.target.value})} required />
                </div>
                <div style={s.modalBotones}>
                  <button type="button" style={s.btnCancelarModal} onClick={() => setMostrarForm(false)}>Cancelar</button>
                  <button type="submit" style={s.btnConfirmar}>Confirmar cita</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <p style={s.loading}>Cargando citas...</p>
        ) : citas.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>📅</span>
            <p style={s.emptyText}>No tienes citas agendadas</p>
            <button style={s.btnAgendarEmpty} onClick={() => setMostrarForm(true)}>
              Agendar mi primera cita
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {citas.map((cita) => {
              const colores = estadoColor(cita.estado);
              return (
                <div key={cita.id} style={s.card}>
                  <div style={s.cardHeader}>
                    <div>
                      <p style={s.cardBarbero}>✂ {barberos.find(b => b.id === cita.barbero)?.nombre || 'Barbero'}</p>
                      <p style={s.cardFecha}>📅 {cita.fecha} — 🕐 {cita.hora}</p>
                    </div>
                    <span style={{...s.badge, background: colores.bg, color: colores.color, border: `1px solid ${colores.border}`}}>
                      {cita.estado}
                    </span>
                  </div>
                  {cita.estado === 'pendiente' && (
                    <button style={s.btnCancelarCita} onClick={() => handleCancelar(cita.id)}>
                      Cancelar cita
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Nunito', sans-serif",
  },
  navbar: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogo: {
    width: '38px',
    height: '38px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  navTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    textShadow: '0 1px 8px rgba(0,0,0,0.15)',
  },
  navActions: {
    display: 'flex',
    gap: '12px',
  },

  navUser: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
},
navAvatar: {
  width: '34px',
  height: '34px',
  background: 'rgba(255,255,255,0.25)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '800',
  color: '#fff',
},
navUsername: {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '14px',
  fontWeight: '700',
},

  btnNueva: {
    padding: '9px 20px',
    background: 'rgba(255,255,255,0.9)',
    color: '#0a4f7a',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  btnLogout: {
    padding: '9px 20px',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  contenido: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  titulo: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '28px',
    textShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  errorBox: {
    background: 'rgba(255,80,80,0.2)',
    border: '1px solid rgba(255,100,100,0.4)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#ffcccc',
    fontSize: '14px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalTitulo: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    fontFamily: "'Nunito', sans-serif",
  },
  modalBotones: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  btnCancelarModal: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  btnConfirmar: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '12px',
    color: '#0a4f7a',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  loading: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: '60px',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    marginTop: '80px',
  },
  emptyIcon: { fontSize: '52px' },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    margin: '12px 0 24px',
  },
  btnAgendarEmpty: {
    padding: '12px 28px',
    background: 'rgba(255,255,255,0.9)',
    color: '#0a4f7a',
    border: 'none',
    borderRadius: '20px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '16px',
    padding: '20px 24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBarbero: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 6px',
  },
  cardFecha: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnCancelarCita: {
    marginTop: '16px',
    padding: '8px 18px',
    background: 'rgba(255,100,100,0.15)',
    border: '1px solid rgba(255,100,100,0.35)',
    borderRadius: '10px',
    color: '#ffaaaa',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: '600',
  },
};