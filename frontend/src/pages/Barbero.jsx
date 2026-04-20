import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Barbero() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seccion, setSeccion] = useState('agenda');
  const [mostrarFormHorario, setMostrarFormHorario] = useState(false);
  const [formHorario, setFormHorario] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    disponible: true,
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [perfilRes, citasRes, barberosRes] = await Promise.all([
        api.get('/usuarios/perfil/'),
        api.get('/citas/'),
        api.get('/barberos/'),
      ]);
      setPerfil(perfilRes.data);
      setCitas(citasRes.data);
      if (barberosRes.data.length > 0) {
        const horariosRes = await api.get(`/horarios/?barbero=${barberosRes.data[0].id}`);
        setHorarios(horariosRes.data);
      }
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarHorario = async (e) => {
    e.preventDefault();
    try {
      const barberosRes = await api.get('/barberos/');
      await api.post('/horarios/', {
        ...formHorario,
        barbero: barberosRes.data[0].id,
      });
      setMostrarFormHorario(false);
      setFormHorario({ fecha: '', hora_inicio: '', hora_fin: '', disponible: true });
      cargarDatos();
    } catch (err) {
      setError('Error al agregar horario.');
    }
  };

  const handleToggleDisponible = async (horario) => {
    try {
      await api.patch(`/horarios/${horario.id}/`, { disponible: !horario.disponible });
      cargarDatos();
    } catch (err) {
      setError('Error al actualizar disponibilidad.');
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
          <span style={s.barberoBadge}>Barbero</span>
        </div>
        <div style={s.navRight}>
          {perfil && <span style={s.navUser}>👤 {perfil.username}</span>}
          <button style={s.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          {[
            { key: 'agenda', label: '📅 Mi agenda' },
            { key: 'disponibilidad', label: '🕐 Disponibilidad' },
          ].map((item) => (
            <button
              key={item.key}
              style={{
                ...s.sidebarBtn,
                background: seccion === item.key ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: seccion === item.key ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: seccion === item.key ? '800' : '500',
                border: seccion === item.key ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
              }}
              onClick={() => setSeccion(item.key)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* Contenido */}
        <main style={s.main}>
          {error && <div style={s.errorBox}>⚠ {error}</div>}

          {loading ? (
            <p style={s.loading}>Cargando...</p>
          ) : (
            <>
              {/* AGENDA */}
              {seccion === 'agenda' && (
                <div>
                  <h2 style={s.titulo}>Mi Agenda</h2>
                  <div style={s.statsRow}>
                    {[
                      { num: citas.length, label: 'Total citas' },
                      { num: citas.filter(c => c.estado === 'pendiente').length, label: 'Pendientes' },
                      { num: citas.filter(c => c.estado === 'completada').length, label: 'Completadas' },
                    ].map((stat, i) => (
                      <div key={i} style={s.statCard}>
                        <p style={s.statNum}>{stat.num}</p>
                        <p style={s.statLabel}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {citas.length === 0 ? (
                    <div style={s.empty}>
                      <span style={s.emptyIcon}>📅</span>
                      <p style={s.emptyText}>No tienes citas agendadas</p>
                    </div>
                  ) : (
                    <div style={s.grid}>
                      {citas.map((cita) => {
                        const col = estadoColor(cita.estado);
                        return (
                          <div key={cita.id} style={s.card}>
                            <div style={s.cardInfo}>
                              <p style={s.cardCliente}>👤 Cliente #{cita.usuario}</p>
                              <p style={s.cardFecha}>📅 {cita.fecha} — 🕐 {cita.hora}</p>
                            </div>
                            <span style={{...s.badge, background: col.bg, color: col.color, border: `1px solid ${col.border}`}}>
                              {cita.estado}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* DISPONIBILIDAD */}
              {seccion === 'disponibilidad' && (
                <div>
                  <div style={s.seccionHeader}>
                    <h2 style={s.titulo}>Mi Disponibilidad</h2>
                    <button style={s.btnAgregar} onClick={() => setMostrarFormHorario(true)}>
                      + Agregar horario
                    </button>
                  </div>

                  {mostrarFormHorario && (
                    <div style={s.formCard}>
                      <h3 style={s.formTitulo}>Nuevo horario</h3>
                      <form onSubmit={handleAgregarHorario} style={s.form}>
                        <div style={s.formRow}>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Fecha</label>
                            <input style={s.input} type="date" value={formHorario.fecha} onChange={(e) => setFormHorario({...formHorario, fecha: e.target.value})} required />
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Hora inicio</label>
                            <input style={s.input} type="time" value={formHorario.hora_inicio} onChange={(e) => setFormHorario({...formHorario, hora_inicio: e.target.value})} required />
                          </div>
                          <div style={s.inputGroup}>
                            <label style={s.label}>Hora fin</label>
                            <input style={s.input} type="time" value={formHorario.hora_fin} onChange={(e) => setFormHorario({...formHorario, hora_fin: e.target.value})} required />
                          </div>
                        </div>
                        <div style={s.formBotones}>
                          <button type="button" style={s.btnCancelarModal} onClick={() => setMostrarFormHorario(false)}>Cancelar</button>
                          <button type="submit" style={s.btnConfirmar}>Guardar horario</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {horarios.length === 0 ? (
                    <div style={s.empty}>
                      <span style={s.emptyIcon}>🕐</span>
                      <p style={s.emptyText}>No tienes horarios registrados</p>
                    </div>
                  ) : (
                    <div style={s.grid}>
                      {horarios.map((horario) => (
                        <div key={horario.id} style={s.card}>
                          <div style={s.cardInfo}>
                            <p style={s.cardCliente}>📅 {horario.fecha}</p>
                            <p style={s.cardFecha}>🕐 {horario.hora_inicio} — {horario.hora_fin}</p>
                          </div>
                          <button
                            style={{
                              ...s.btnToggle,
                              background: horario.disponible ? 'rgba(100,255,180,0.2)' : 'rgba(255,100,100,0.15)',
                              color: horario.disponible ? '#6fffc0' : '#ffaaaa',
                              border: horario.disponible ? '1px solid rgba(100,255,180,0.4)' : '1px solid rgba(255,100,100,0.35)',
                            }}
                            onClick={() => handleToggleDisponible(horario)}
                          >
                            {horario.disponible ? '✓ Disponible' : '✗ No disponible'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
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
  },
  barberoBadge: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.35)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 12px',
    borderRadius: '20px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navUser: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    fontWeight: '600',
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
  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 57px)',
  },
  sidebar: {
    width: '220px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.15)',
    padding: '24px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarBtn: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Nunito', sans-serif",
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    padding: '32px',
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
  loading: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  titulo: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 24px',
    textShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginBottom: '28px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 4px',
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
  },
  empty: {
    textAlign: 'center',
    marginTop: '60px',
  },
  emptyIcon: { fontSize: '48px' },
  emptyText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '16px',
    margin: '12px 0',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardCliente: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px',
  },
  cardFecha: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  seccionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  btnAgregar: {
    padding: '10px 22px',
    background: 'rgba(255,255,255,0.9)',
    color: '#0a4f7a',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  formCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  formTitulo: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  input: {
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: "'Nunito', sans-serif",
  },
  formBotones: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  btnCancelarModal: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  btnConfirmar: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '12px',
    color: '#0a4f7a',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  btnToggle: {
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
};