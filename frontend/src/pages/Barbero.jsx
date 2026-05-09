import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';

// Genera turnos entre hora_inicio y hora_fin cada `duracion` minutos
function generarTurnos(horaInicio, horaFin, duracionMin) {
  const turnos = [];
  const [hI, mI] = horaInicio.split(':').map(Number);
  const [hF, mF] = horaFin.split(':').map(Number);
  let actual = hI * 60 + mI;
  const fin = hF * 60 + mF;
  while (actual + duracionMin <= fin) {
    const h = String(Math.floor(actual / 60)).padStart(2, '0');
    const m = String(actual % 60).padStart(2, '0');
    const hFin = Math.floor((actual + duracionMin) / 60);
    const mFin = (actual + duracionMin) % 60;
    const hFinStr = String(hFin).padStart(2, '0');
    const mFinStr = String(mFin).padStart(2, '0');
    turnos.push({ hora_inicio: `${h}:${m}`, hora_fin: `${hFinStr}:${mFinStr}` });
    actual += duracionMin;
  }
  return turnos;
}

export default function Barbero() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [barberoId, setBarberoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState('agenda');
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const { toast, mostrarToast, cerrarToast } = useToast();

  // Form generador de turnos
  const [formTurnos, setFormTurnos] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    duracion: '30',
  });
  const [preview, setPreview] = useState([]);

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
      // Buscar el barbero vinculado al usuario actual
      const mi_barbero = barberosRes.data.find(
        b => b.usuario === perfilRes.data.id
      );
      if (mi_barbero) {
        setBarberoId(mi_barbero.id);
        const horariosRes = await api.get(`/horarios/?barbero=${mi_barbero.id}`);
        setHorarios(horariosRes.data);
      }
    } catch {
      mostrarToast('Error al cargar los datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const actualizarPreview = (form) => {
    if (form.hora_inicio && form.hora_fin && form.duracion) {
      const turnos = generarTurnos(form.hora_inicio, form.hora_fin, parseInt(form.duracion));
      setPreview(turnos);
    } else {
      setPreview([]);
    }
  };

  const handleFormChange = (campo, valor) => {
    const nuevo = { ...formTurnos, [campo]: valor };
    setFormTurnos(nuevo);
    actualizarPreview(nuevo);
  };

  const handleGenerarTurnos = async (e) => {
    e.preventDefault();
    if (!barberoId) {
      mostrarToast('Tu usuario no está vinculado a un barbero. Contacta al administrador.', 'error');
      return;
    }
    if (preview.length === 0) {
      mostrarToast('No se generaron turnos. Verifica los horarios y la duración.', 'error');
      return;
    }
    try {
      await Promise.all(
        preview.map(turno =>
          api.post('/horarios/', {
            barbero: barberoId,
            fecha: formTurnos.fecha,
            hora_inicio: turno.hora_inicio,
            hora_fin: turno.hora_fin,
            disponible: true,
          })
        )
      );
      setMostrarGenerador(false);
      setFormTurnos({ fecha: '', hora_inicio: '', hora_fin: '', duracion: '30' });
      setPreview([]);
      cargarDatos();
      mostrarToast(`${preview.length} turnos generados correctamente.`, 'exito');
    } catch {
      mostrarToast('Error al generar los turnos.', 'error');
    }
  };

  const handleToggleDisponible = async (horario) => {
    try {
      await api.patch(`/horarios/${horario.id}/`, { disponible: !horario.disponible });
      cargarDatos();
    } catch {
      mostrarToast('Error al actualizar disponibilidad.', 'error');
    }
  };

  const handleEliminarHorario = async (id) => {
    try {
      await api.delete(`/horarios/${id}/`);
      cargarDatos();
      mostrarToast('Turno eliminado.', 'exito');
    } catch {
      mostrarToast('Error al eliminar el turno.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      await api.post('/usuarios/logout/', { refresh });
    } catch { /* continuar */ } finally {
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

  // Agrupar horarios por fecha
  const horariosPorFecha = horarios.reduce((acc, h) => {
    if (!acc[h.fecha]) acc[h.fecha] = [];
    acc[h.fecha].push(h);
    return acc;
  }, {});

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

        <main style={s.main}>
          {loading ? (
            <p style={s.loading}>Cargando...</p>
          ) : (
            <>
              {/* ── AGENDA ── */}
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
                            <span style={{ ...s.badge, background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
                              {cita.estado}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── DISPONIBILIDAD ── */}
              {seccion === 'disponibilidad' && (
                <div>
                  <div style={s.seccionHeader}>
                    <h2 style={s.titulo}>Mi Disponibilidad</h2>
                    <button style={s.btnAgregar} onClick={() => setMostrarGenerador(true)}>
                      + Generar turnos
                    </button>
                  </div>

                  {!barberoId && (
                    <div style={s.aviso}>
                      ⚠ Tu usuario no está vinculado a un barbero. Contacta al administrador para que lo configure.
                    </div>
                  )}

                  {Object.keys(horariosPorFecha).length === 0 ? (
                    <div style={s.empty}>
                      <span style={s.emptyIcon}>🕐</span>
                      <p style={s.emptyText}>No tienes turnos registrados</p>
                      <button style={s.btnAgendarEmpty} onClick={() => setMostrarGenerador(true)}>
                        Generar mis primeros turnos
                      </button>
                    </div>
                  ) : (
                    Object.entries(horariosPorFecha)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([fecha, turnos]) => (
                        <div key={fecha} style={s.fechaGrupo}>
                          <p style={s.fechaLabel}>📅 {fecha}</p>
                          <div style={s.turnosGrid}>
                            {turnos
                              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                              .map((horario) => (
                                <div key={horario.id} style={s.turnoCard}>
                                  <p style={s.turnoHora}>
                                    {horario.hora_inicio.slice(0, 5)} — {horario.hora_fin.slice(0, 5)}
                                  </p>
                                  <div style={s.turnoAcciones}>
                                    <button
                                      style={{
                                        ...s.btnToggle,
                                        background: horario.disponible ? 'rgba(100,255,180,0.2)' : 'rgba(255,100,100,0.15)',
                                        color: horario.disponible ? '#6fffc0' : '#ffaaaa',
                                        border: horario.disponible ? '1px solid rgba(100,255,180,0.4)' : '1px solid rgba(255,100,100,0.35)',
                                      }}
                                      onClick={() => handleToggleDisponible(horario)}
                                    >
                                      {horario.disponible ? '✓ Disponible' : '✕ Oculto'}
                                    </button>
                                    <button style={s.btnEliminarTurno} onClick={() => handleEliminarHorario(horario.id)}>
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── MODAL: GENERADOR DE TURNOS ── */}
      {mostrarGenerador && (
        <div style={s.modalOverlay} onClick={(e) => e.target === e.currentTarget && setMostrarGenerador(false)}>
          <div style={s.modal}>
            <h3 style={s.modalTitulo}>Generar turnos del día</h3>
            <form onSubmit={handleGenerarTurnos} style={s.form}>
              <div style={s.inputGroup}>
                <label style={s.label}>Fecha</label>
                <input style={s.input} type="date" value={formTurnos.fecha}
                  onChange={(e) => handleFormChange('fecha', e.target.value)} required />
              </div>
              <div style={s.formRow}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Hora de entrada</label>
                  <input style={s.input} type="time" value={formTurnos.hora_inicio}
                    onChange={(e) => handleFormChange('hora_inicio', e.target.value)} required />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Hora de salida</label>
                  <input style={s.input} type="time" value={formTurnos.hora_fin}
                    onChange={(e) => handleFormChange('hora_fin', e.target.value)} required />
                </div>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Duración por corte (minutos)</label>
                <select style={s.input} value={formTurnos.duracion}
                  onChange={(e) => handleFormChange('duracion', e.target.value)}>
                  <option value="20">20 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>

              {/* Preview de turnos */}
              {preview.length > 0 && (
                <div style={s.preview}>
                  <p style={s.previewTitulo}>Vista previa — {preview.length} turnos</p>
                  <div style={s.previewGrid}>
                    {preview.map((t, i) => (
                      <span key={i} style={s.previewTurno}>
                        {t.hora_inicio} — {t.hora_fin}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={s.formBotones}>
                <button type="button" style={s.btnCancelarModal} onClick={() => { setMostrarGenerador(false); setPreview([]); }}>
                  Cancelar
                </button>
                <button type="submit" style={{ ...s.btnConfirmar, opacity: preview.length > 0 ? 1 : 0.5 }}
                  disabled={preview.length === 0}>
                  Crear {preview.length > 0 ? `${preview.length} turnos` : 'turnos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={cerrarToast} />}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', fontFamily: "'Nunito', sans-serif" },
  navbar: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: {
    width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
  },
  navTitle: { color: '#fff', fontSize: '20px', fontWeight: '800' },
  barberoBadge: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
    color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 12px', borderRadius: '20px',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600' },
  btnLogout: {
    padding: '9px 20px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', fontSize: '14px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  layout: { display: 'flex', minHeight: 'calc(100vh - 57px)' },
  sidebar: {
    width: '220px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.15)',
    padding: '24px 14px', display: 'flex', flexDirection: 'column', gap: '8px',
  },
  sidebarBtn: {
    padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    cursor: 'pointer', textAlign: 'left', fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s',
  },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  loading: { color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  titulo: { fontSize: '26px', fontWeight: '800', color: '#fff', margin: '0 0 24px', textShadow: '0 2px 10px rgba(0,0,0,0.15)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' },
  statCard: {
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '20px', textAlign: 'center',
  },
  statNum: { fontSize: '32px', fontWeight: '800', color: '#fff', margin: '0 0 4px' },
  statLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0 },
  empty: { textAlign: 'center', marginTop: '60px' },
  emptyIcon: { fontSize: '48px' },
  emptyText: { color: 'rgba(255,255,255,0.65)', fontSize: '16px', margin: '12px 0 24px' },
  btnAgendarEmpty: {
    padding: '12px 28px', background: 'rgba(255,255,255,0.9)', color: '#0a4f7a',
    border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '800',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  aviso: {
    background: 'rgba(255,220,100,0.15)', border: '1px solid rgba(255,220,100,0.35)',
    borderRadius: '12px', padding: '14px 18px', color: '#ffe066',
    fontSize: '14px', marginBottom: '24px',
  },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px',
    padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardCliente: { fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  cardFecha: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 },
  badge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  seccionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  btnAgregar: {
    padding: '10px 22px', background: 'rgba(255,255,255,0.9)', color: '#0a4f7a',
    border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '800',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  fechaGrupo: { marginBottom: '28px' },
  fechaLabel: { fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' },
  turnosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' },
  turnoCard: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px',
    padding: '14px 16px',
  },
  turnoHora: { fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 10px' },
  turnoAcciones: { display: 'flex', gap: '8px', alignItems: 'center' },
  btnToggle: {
    flex: 1, padding: '7px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  btnEliminarTurno: {
    padding: '7px 10px', background: 'rgba(255,100,100,0.15)',
    border: '1px solid rgba(255,100,100,0.35)', borderRadius: '10px',
    color: '#ffaaaa', fontSize: '14px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  // Modal generador
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'rgba(10,50,80,0.95)', backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px',
    padding: '36px 32px', width: '100%', maxWidth: '500px',
    maxHeight: '85vh', overflowY: 'auto',
    boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
  },
  modalTitulo: { fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  input: {
    padding: '11px 14px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
    color: '#fff', fontSize: '14px', outline: 'none', fontFamily: "'Nunito', sans-serif",
  },
  preview: {
    background: 'rgba(46,196,182,0.1)', border: '1px solid rgba(46,196,182,0.3)',
    borderRadius: '14px', padding: '16px',
  },
  previewTitulo: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', margin: '0 0 10px' },
  previewGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  previewTurno: {
    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '12px',
    color: '#fff', fontWeight: '600',
  },
  formBotones: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  btnCancelarModal: {
    padding: '10px 20px', background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
    color: 'rgba(255,255,255,0.8)', fontSize: '14px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  btnConfirmar: {
    padding: '10px 20px', background: 'rgba(255,255,255,0.9)',
    border: 'none', borderRadius: '12px', color: '#0a4f7a',
    fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
};
