import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import BarberoCard from '../components/BarberoCard';
import AvatarPerfil from '../components/AvatarPerfil';
import useToast from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

export default function Citas() {
  const navigate = useNavigate();
  const { usuario, actualizarPerfil, logout } = useAuth();
  const [citas,    setCitas]    = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [perfil,   setPerfil]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [vista,    setVista]    = useState('citas');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form,     setForm]     = useState({ barbero: '', fecha: '', hora: '' });
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const { toast, mostrarToast, cerrarToast } = useToast();

  useEffect(() => { cargarDatos(); }, []);

  // Cargar horarios disponibles cuando cambia barbero o fecha
  useEffect(() => {
    if (form.barbero && form.fecha) {
      cargarHorarios(form.barbero, form.fecha);
    } else {
      setHorarios([]);
      setForm(f => ({ ...f, hora: '' }));
    }
  }, [form.barbero, form.fecha]);

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
    } catch {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const cargarHorarios = async (barberoId, fecha) => {
    setLoadingHorarios(true);
    setHorarios([]);
    setForm(f => ({ ...f, hora: '' }));
    try {
      const res = await api.get(`/horarios/?barbero=${barberoId}&disponible=true`);
      // Filtrar por fecha y que no tengan cita pendiente ya asignada
      const citasBarbero = citas.filter(
        c => String(c.barbero) === String(barberoId) &&
             c.fecha === fecha &&
             c.estado !== 'cancelada'
      );
      const horasOcupadas = citasBarbero.map(c => c.hora.slice(0, 5));
      const disponibles = res.data.filter(
        h => h.fecha === fecha && !horasOcupadas.includes(h.hora_inicio.slice(0, 5))
      );
      setHorarios(disponibles);
    } catch {
      setHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const abrirFormConBarbero = (barberoId) => {
    setForm({ barbero: String(barberoId), fecha: '', hora: '' });
    setVista('citas');
    setMostrarForm(true);
  };

  const handleAgendar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/citas/', form);
      setMostrarForm(false);
      setForm({ barbero: '', fecha: '', hora: '' });
      setHorarios([]);
      cargarDatos();
      mostrarToast('Cita agendada correctamente', 'exito');
    } catch {
      mostrarToast('El horario ya está ocupado.', 'error');
    }
  };

  const handleCancelar = async (id) => {
    try {
      await api.post(`/citas/${id}/cancelar/`);
      cargarDatos();
      mostrarToast('Cita cancelada correctamente.', 'exito');
    } catch {
      mostrarToast('Error al cancelar la cita.', 'error');
    }
  };

  const handleActualizarAvatar = (nuevosPerfil) => {
    setPerfil(nuevosPerfil);
    actualizarPerfil(nuevosPerfil);
  };

  const estadoColor = (estado) => ({
    pendiente:  { bg: 'rgba(255,220,100,0.2)', color: '#ffe066', border: 'rgba(255,220,100,0.4)' },
    completada: { bg: 'rgba(100,255,180,0.2)', color: '#6fffc0', border: 'rgba(100,255,180,0.4)' },
    cancelada:  { bg: 'rgba(255,100,100,0.2)', color: '#ffaaaa', border: 'rgba(255,100,100,0.4)' },
  }[estado] || {});

  const barberoSeleccionado = barberos.find(b => String(b.id) === form.barbero);

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navBrand}>
          <div style={s.navLogo}>✂</div>
          <span style={s.navTitle}>Barber Ecci Cut</span>
        </div>
        <div style={s.navCenter}>
          {[
            { key: 'citas',    label: '📅 Mis citas' },
            { key: 'barberos', label: '✂ Barberos' },
          ].map((item) => (
            <button key={item.key}
              style={{
                ...s.navTab,
                background: vista === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                color:      vista === item.key ? '#fff' : 'rgba(255,255,255,0.6)',
                border:     vista === item.key ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
              }}
              onClick={() => setVista(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div style={s.navActions}>
          {perfil && (
            <div style={s.navUser}>
              <AvatarPerfil perfil={perfil} onActualizar={handleActualizarAvatar} size={34} />
              <span style={s.navUsername}>Hola, {perfil.username}</span>
            </div>
          )}
          <button style={s.btnNueva} onClick={() => { setForm({ barbero: '', fecha: '', hora: '' }); setMostrarForm(true); }}>
            + Nueva cita
          </button>
          <button style={s.btnLogout} onClick={() => logout()}>Cerrar sesión</button>
        </div>
      </nav>

      <div style={s.contenido}>
        {error && <div style={s.errorBox}>⚠ {error}</div>}

        {/* ── CITAS ── */}
        {vista === 'citas' && (
          <>
            <h2 style={s.titulo}>Mis citas</h2>
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
                  const col  = estadoColor(cita.estado);
                  const barb = barberos.find(b => b.id === cita.barbero);
                  return (
                    <div key={cita.id} style={s.card}>
                      <div style={s.cardHeader}>
                        <div>
                          <p style={s.cardBarbero}>✂ {barb?.nombre || 'Barbero'}</p>
                          <p style={s.cardFecha}>📅 {cita.fecha} — 🕐 {cita.hora}</p>
                        </div>
                        <span style={{ ...s.badge, background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
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
          </>
        )}

        {/* ── BARBEROS ── */}
        {vista === 'barberos' && (
          <>
            <h2 style={s.titulo}>Nuestros barberos</h2>
            <p style={s.subtitulo}>Elige a tu barbero de confianza y agenda tu cita con él.</p>
            {loading ? (
              <p style={s.loading}>Cargando barberos...</p>
            ) : barberos.length === 0 ? (
              <div style={s.empty}>
                <span style={s.emptyIcon}>✂</span>
                <p style={s.emptyText}>No hay barberos disponibles por el momento</p>
              </div>
            ) : (
              <div style={s.barberoGrid}>
                {barberos.map((b) => (
                  <BarberoCard key={b.id} barbero={b} seleccionado={false}
                    onSeleccionar={() => abrirFormConBarbero(b.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL AGENDAR ── */}
      {mostrarForm && (
        <div style={s.modalOverlay} onClick={(e) => e.target === e.currentTarget && setMostrarForm(false)}>
          <div style={s.modal}>
            <h3 style={s.modalTitulo}>Agendar nueva cita</h3>
            <form onSubmit={handleAgendar} style={s.form}>

              {/* Selector barbero */}
              <div style={s.inputGroup}>
                <label style={s.label}>Barbero</label>
                <div style={s.barberoGridModal}>
                  {barberos.map((b) => (
                    <BarberoCard key={b.id} barbero={b}
                      seleccionado={String(b.id) === form.barbero}
                      onSeleccionar={() => setForm({ ...form, barbero: String(b.id), hora: '' })} />
                  ))}
                </div>
                <input type="text" value={form.barbero} onChange={() => {}} required style={{ display: 'none' }} />
              </div>

              {/* Fecha */}
              <div style={s.inputGroup}>
                <label style={s.label}>Fecha</label>
                <input style={s.input} type="date" value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value, hora: '' })} required />
              </div>

              {/* Turnos disponibles */}
              {form.barbero && form.fecha && (
                <div style={s.inputGroup}>
                  <label style={s.label}>Turno disponible</label>
                  {loadingHorarios ? (
                    <p style={s.horarioMsg}>Cargando turnos...</p>
                  ) : horarios.length === 0 ? (
                    <p style={s.horarioMsg}>No hay turnos disponibles para esta fecha.</p>
                  ) : (
                    <div style={s.turnosGrid}>
                      {horarios.map((h) => (
                        <button key={h.id} type="button"
                          style={{
                            ...s.turnoBtn,
                            background: form.hora === h.hora_inicio.slice(0, 5)
                              ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                            color: form.hora === h.hora_inicio.slice(0, 5)
                              ? '#0a4f7a' : '#fff',
                            border: form.hora === h.hora_inicio.slice(0, 5)
                              ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.2)',
                            fontWeight: form.hora === h.hora_inicio.slice(0, 5) ? '800' : '500',
                          }}
                          onClick={() => setForm({ ...form, hora: h.hora_inicio.slice(0, 5) })}
                        >
                          {h.hora_inicio.slice(0, 5)} — {h.hora_fin.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                  <input type="text" value={form.hora} onChange={() => {}} required style={{ display: 'none' }} />
                </div>
              )}

              {/* Resumen */}
              {barberoSeleccionado && (
                <div style={s.barberoResumen}>
                  <span>✂</span>
                  <span style={{ fontWeight: '700' }}>{barberoSeleccionado.nombre}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                    {barberoSeleccionado.especialidad}
                  </span>
                  {form.hora && <span style={{ marginLeft: 'auto', fontWeight: '700' }}>🕐 {form.hora}</span>}
                </div>
              )}

              <div style={s.modalBotones}>
                <button type="button" style={s.btnCancelarModal} onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
                <button type="submit"
                  style={{ ...s.btnConfirmar, opacity: (form.barbero && form.hora) ? 1 : 0.5 }}
                  disabled={!form.barbero || !form.hora}>
                  Confirmar cita
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
  page:     { minHeight: '100vh', fontFamily: "'Nunito', sans-serif" },
  navbar:   {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
  },
  navBrand:    { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  navLogo:     {
    width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
  },
  navTitle:    { color: '#fff', fontSize: '20px', fontWeight: '800' },
  navCenter:   { display: 'flex', gap: '8px' },
  navTab:      {
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
  },
  navActions:  { display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 },
  navUser:     { display: 'flex', alignItems: 'center', gap: '8px' },
  navUsername: { color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '700' },
  btnNueva:    {
    padding: '9px 20px', background: 'rgba(255,255,255,0.9)', color: '#0a4f7a',
    border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '800',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  btnLogout:   {
    padding: '9px 20px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', fontSize: '14px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  contenido:   { maxWidth: '960px', margin: '0 auto', padding: '40px 24px' },
  titulo:      { fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '8px' },
  subtitulo:   { fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '28px' },
  errorBox:    {
    background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,100,100,0.4)',
    borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#ffcccc', fontSize: '14px',
  },
  loading:     { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: '60px', fontSize: '16px' },
  empty:       { textAlign: 'center', marginTop: '80px' },
  emptyIcon:   { fontSize: '52px' },
  emptyText:   { color: 'rgba(255,255,255,0.7)', fontSize: '16px', margin: '12px 0 24px' },
  btnAgendarEmpty: {
    padding: '12px 28px', background: 'rgba(255,255,255,0.9)', color: '#0a4f7a',
    border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '800',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  grid:        { display: 'flex', flexDirection: 'column', gap: '14px' },
  card:        {
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '20px 24px',
  },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardBarbero: { fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 6px' },
  cardFecha:   { fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0 },
  badge:       { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  btnCancelarCita: {
    marginTop: '16px', padding: '8px 18px',
    background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.35)',
    borderRadius: '10px', color: '#ffaaaa', fontSize: '13px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: '600',
  },
  barberoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  modalOverlay:{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal:       {
    background: 'rgba(10,50,80,0.92)', backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px',
    padding: '36px 32px', width: '100%', maxWidth: '560px',
    maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
  },
  modalTitulo: { fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 24px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:       { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  input:       {
    padding: '12px 16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
    color: '#fff', fontSize: '15px', outline: 'none', fontFamily: "'Nunito', sans-serif",
  },
  barberoGridModal: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' },
  horarioMsg:  { color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontStyle: 'italic' },
  turnosGrid:  { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  turnoBtn:    {
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
  },
  barberoResumen: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
    background: 'rgba(46,196,182,0.15)', border: '1px solid rgba(46,196,182,0.35)',
    borderRadius: '12px', color: '#fff', fontSize: '13px',
  },
  modalBotones: { display: 'flex', gap: '12px', marginTop: '4px' },
  btnCancelarModal: {
    flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px',
    color: 'rgba(255,255,255,0.8)', fontSize: '15px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  btnConfirmar: {
    flex: 1, padding: '12px', background: 'rgba(255,255,255,0.9)',
    border: 'none', borderRadius: '12px', color: '#0a4f7a',
    fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
};
