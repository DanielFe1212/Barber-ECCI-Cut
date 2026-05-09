import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';

export default function Admin() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState('citas');
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, mostrarToast, cerrarToast } = useToast();

  // Modales
  const [modalBarbero, setModalBarbero] = useState(false);
  const [modalEditarBarbero, setModalEditarBarbero] = useState(null); // barbero objeto
  const [modalConfirmar, setModalConfirmar] = useState(null); // { mensaje, onConfirmar }

  // Forms
  const [formBarbero, setFormBarbero] = useState({
    username: '', email: '', password: '', nombre: '', especialidad: '',
  });
  const [formEditar, setFormEditar] = useState({
    nombre: '', especialidad: '', descripcion: '', foto: null,
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [citasRes, barberosRes, usuariosRes] = await Promise.all([
        api.get('/citas/'),
        api.get('/barberos/'),
        api.get('/usuarios/'),
      ]);
      setCitas(citasRes.data);
      setBarberos(barberosRes.data);
      setUsuarios(usuariosRes.data);
    } catch {
      mostrarToast('Error al cargar los datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── CITAS ──
  const handleCancelarCita = (id) => {
    setModalConfirmar({
      mensaje: '¿Cancelar esta cita?',
      onConfirmar: async () => {
        try {
          await api.post(`/citas/${id}/cancelar/`);
          cargarDatos();
          mostrarToast('Cita cancelada.', 'exito');
        } catch {
          mostrarToast('Error al cancelar la cita.', 'error');
        }
      },
    });
  };

  const handleCompletarCita = (id) => {
    setModalConfirmar({
      mensaje: '¿Marcar esta cita como completada?',
      onConfirmar: async () => {
        try {
          await api.patch(`/citas/${id}/completar/`);
          cargarDatos();
          mostrarToast('Cita marcada como completada.', 'exito');
        } catch {
          mostrarToast('Error al completar la cita.', 'error');
        }
      },
    });
  };

  // ── BARBEROS ──
  const handleCrearBarbero = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/crear-barbero/', formBarbero);
      setModalBarbero(false);
      setFormBarbero({ username: '', email: '', password: '', nombre: '', especialidad: '' });
      cargarDatos();
      mostrarToast('Barbero creado correctamente.', 'exito');
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) mostrarToast(data.username[0], 'error');
      else if (data?.email) mostrarToast(data.email[0], 'error');
      else if (data?.password) mostrarToast(data.password[0], 'error');
      else mostrarToast('Error al crear el barbero.', 'error');
    }
  };

  const abrirEditarBarbero = (barbero) => {
    setFormEditar({
      nombre: barbero.nombre,
      especialidad: barbero.especialidad,
      descripcion: barbero.descripcion || '',
      foto: null,
    });
    setModalEditarBarbero(barbero);
  };

  const handleEditarBarbero = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nombre', formEditar.nombre);
    data.append('especialidad', formEditar.especialidad);
    data.append('descripcion', formEditar.descripcion);
    if (formEditar.foto) data.append('foto', formEditar.foto);
    try {
      await api.patch(`/barberos/${modalEditarBarbero.id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModalEditarBarbero(null);
      cargarDatos();
      mostrarToast('Barbero actualizado correctamente.', 'exito');
    } catch {
      mostrarToast('Error al actualizar el barbero.', 'error');
    }
  };

  const handleEliminarBarbero = (id) => {
    setModalConfirmar({
      mensaje: '¿Eliminar este barbero? Esta acción no se puede deshacer.',
      onConfirmar: async () => {
        try {
          await api.delete(`/barberos/${id}/`);
          cargarDatos();
          mostrarToast('Barbero eliminado.', 'exito');
        } catch {
          mostrarToast('Error al eliminar el barbero.', 'error');
        }
      },
    });
  };

  // ── USUARIOS ──
  const handleEliminarUsuario = (id, username) => {
    setModalConfirmar({
      mensaje: `¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`,
      onConfirmar: async () => {
        try {
          await api.delete(`/usuarios/${id}/`);
          cargarDatos();
          mostrarToast('Usuario eliminado.', 'exito');
        } catch {
          mostrarToast('Error al eliminar el usuario.', 'error');
        }
      },
    });
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

  const rolColor = (rol) => {
    if (rol === 'admin') return { bg: 'rgba(100,150,255,0.2)', color: '#aac4ff', border: 'rgba(100,150,255,0.4)' };
    if (rol === 'barbero') return { bg: 'rgba(100,255,180,0.2)', color: '#6fffc0', border: 'rgba(100,255,180,0.4)' };
    return { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.2)' };
  };

  const nombreUsuario = (citaUsuarioId) => {
    const u = usuarios.find(u => u.id === citaUsuarioId);
    return u ? u.username : `#${citaUsuarioId}`;
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navBrand}>
          <div style={s.navLogo}>✂</div>
          <span style={s.navTitle}>Barber Ecci Cut</span>
          <span style={s.adminBadge}>Admin</span>
        </div>
        <button style={s.btnLogout} onClick={handleLogout}>Cerrar sesión</button>
      </nav>

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          {[
            { key: 'citas', label: '📅 Citas' },
            { key: 'barberos', label: '✂ Barberos' },
            { key: 'usuarios', label: '👥 Usuarios' },
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
          {loading ? (
            <p style={s.loading}>Cargando...</p>
          ) : (
            <>
              {/* ── CITAS ── */}
              {seccion === 'citas' && (
                <div>
                  <h2 style={s.titulo}>Gestión de Citas</h2>
                  <div style={s.statsRow}>
                    {[
                      { num: citas.length, label: 'Total' },
                      { num: citas.filter(c => c.estado === 'pendiente').length, label: 'Pendientes' },
                      { num: citas.filter(c => c.estado === 'completada').length, label: 'Completadas' },
                      { num: citas.filter(c => c.estado === 'cancelada').length, label: 'Canceladas' },
                    ].map((stat, i) => (
                      <div key={i} style={s.statCard}>
                        <p style={s.statNum}>{stat.num}</p>
                        <p style={s.statLabel}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={s.tabla}>
                    <div style={s.tablaHeader}>
                      <span>Cliente</span>
                      <span>Barbero</span>
                      <span>Fecha</span>
                      <span>Hora</span>
                      <span>Estado</span>
                      <span>Acciones</span>
                    </div>
                    {citas.map((cita) => {
                      const col = estadoColor(cita.estado);
                      return (
                        <div key={cita.id} style={s.tablaFila}>
                          <span style={s.tablaCell}>{nombreUsuario(cita.usuario)}</span>
                          <span style={s.tablaCell}>{barberos.find(b => b.id === cita.barbero)?.nombre || '—'}</span>
                          <span style={s.tablaCell}>{cita.fecha}</span>
                          <span style={s.tablaCell}>{cita.hora}</span>
                          <span>
                            <span style={{ ...s.badge, background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
                              {cita.estado}
                            </span>
                          </span>
                          <span style={s.accionesCell}>
                            {cita.estado === 'pendiente' && (
                              <>
                                <button style={s.btnCompletar} onClick={() => handleCompletarCita(cita.id)}>
                                  ✓
                                </button>
                                <button style={s.btnCancelar} onClick={() => handleCancelarCita(cita.id)}>
                                  ✕
                                </button>
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── BARBEROS ── */}
              {seccion === 'barberos' && (
                <div>
                  <div style={s.seccionHeader}>
                    <h2 style={s.titulo}>Gestión de Barberos</h2>
                    <button style={s.btnAgregar} onClick={() => setModalBarbero(true)}>
                      + Nuevo barbero
                    </button>
                  </div>
                  <div style={s.grid}>
                    {barberos.map((barbero) => (
                      <div key={barbero.id} style={s.barberoCard}>
                        <div style={s.barberoAvatar}>
                          {barbero.foto_url
                            ? <img src={barbero.foto_url} alt={barbero.nombre} style={s.barberoFoto} />
                            : barbero.nombre.charAt(0).toUpperCase()
                          }
                        </div>
                        <div style={s.barberoInfo}>
                          <p style={s.barberoNombre}>{barbero.nombre}</p>
                          <p style={s.barberoEsp}>{barbero.especialidad}</p>
                          {barbero.descripcion && (
                            <p style={s.barberoDesc}>{barbero.descripcion}</p>
                          )}
                        </div>
                        <div style={s.barberoAcciones}>
                          <button style={s.btnEditar} onClick={() => abrirEditarBarbero(barbero)}>
                            Editar
                          </button>
                          <button style={s.btnEliminar} onClick={() => handleEliminarBarbero(barbero.id)}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── USUARIOS ── */}
              {seccion === 'usuarios' && (
                <div>
                  <div style={s.seccionHeader}>
                    <h2 style={s.titulo}>Gestión de Usuarios</h2>
                  </div>
                  <div style={s.tabla}>
                    <div style={{ ...s.tablaHeader, gridTemplateColumns: 'repeat(5, 1fr)' }}>
                      <span>ID</span>
                      <span>Usuario</span>
                      <span>Email</span>
                      <span>Rol</span>
                      <span>Acción</span>
                    </div>
                    {usuarios.map((usuario) => {
                      const rc = rolColor(usuario.rol);
                      return (
                        <div key={usuario.id} style={{ ...s.tablaFila, gridTemplateColumns: 'repeat(5, 1fr)' }}>
                          <span style={s.tablaCell}>#{usuario.id}</span>
                          <span style={s.tablaCell}>{usuario.username}</span>
                          <span style={s.tablaCell}>{usuario.email}</span>
                          <span>
                            <span style={{ ...s.badge, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                              {usuario.rol}
                            </span>
                          </span>
                          <span>
                            {usuario.rol !== 'admin' && (
                              <button style={s.btnCancelar} onClick={() => handleEliminarUsuario(usuario.id, usuario.username)}>
                                Eliminar
                              </button>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── MODAL: CREAR BARBERO ── */}
      {modalBarbero && (
        <div style={s.modalOverlay} onClick={(e) => e.target === e.currentTarget && setModalBarbero(false)}>
          <div style={s.modal}>
            <h3 style={s.modalTitulo}>Nuevo barbero</h3>
            <form onSubmit={handleCrearBarbero} style={s.form}>
              <div style={s.formRow}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Usuario</label>
                  <input style={s.input} type="text" placeholder="nombre_usuario" value={formBarbero.username}
                    onChange={(e) => setFormBarbero({ ...formBarbero, username: e.target.value })} required />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Correo electrónico</label>
                  <input style={s.input} type="email" placeholder="correo@email.com" value={formBarbero.email}
                    onChange={(e) => setFormBarbero({ ...formBarbero, email: e.target.value })} required />
                </div>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Contraseña</label>
                <input style={s.input} type="password" placeholder="Mínimo 8 caracteres" value={formBarbero.password}
                  onChange={(e) => setFormBarbero({ ...formBarbero, password: e.target.value })} required />
              </div>
              <div style={s.formRow}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Nombre completo</label>
                  <input style={s.input} type="text" placeholder="Nombre visible" value={formBarbero.nombre}
                    onChange={(e) => setFormBarbero({ ...formBarbero, nombre: e.target.value })} required />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Especialidad</label>
                  <input style={s.input} type="text" placeholder="Ej: Corte clásico" value={formBarbero.especialidad}
                    onChange={(e) => setFormBarbero({ ...formBarbero, especialidad: e.target.value })} required />
                </div>
              </div>
              <div style={s.formBotones}>
                <button type="button" style={s.btnCancelarModal} onClick={() => setModalBarbero(false)}>Cancelar</button>
                <button type="submit" style={s.btnConfirmar}>Crear barbero</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR BARBERO ── */}
      {modalEditarBarbero && (
        <div style={s.modalOverlay} onClick={(e) => e.target === e.currentTarget && setModalEditarBarbero(null)}>
          <div style={s.modal}>
            <h3 style={s.modalTitulo}>Editar — {modalEditarBarbero.nombre}</h3>
            <form onSubmit={handleEditarBarbero} style={s.form}>
              <div style={s.formRow}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Nombre</label>
                  <input style={s.input} type="text" value={formEditar.nombre}
                    onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })} required />
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>Especialidad</label>
                  <input style={s.input} type="text" value={formEditar.especialidad}
                    onChange={(e) => setFormEditar({ ...formEditar, especialidad: e.target.value })} required />
                </div>
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Descripción</label>
                <textarea style={{ ...s.input, resize: 'vertical', minHeight: '80px' }} value={formEditar.descripcion}
                  onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
                  placeholder="Descripción del barbero..." />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Foto {modalEditarBarbero.foto_url && '(dejar vacío para mantener la actual)'}</label>
                <input style={{ ...s.input, padding: '10px 14px' }} type="file" accept="image/*"
                  onChange={(e) => setFormEditar({ ...formEditar, foto: e.target.files[0] || null })} />
              </div>
              <div style={s.formBotones}>
                <button type="button" style={s.btnCancelarModal} onClick={() => setModalEditarBarbero(null)}>Cancelar</button>
                <button type="submit" style={s.btnConfirmar}>Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRMACIÓN ── */}
      {modalConfirmar && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, maxWidth: '380px', textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '16px', marginBottom: '28px', lineHeight: '1.5' }}>
              {modalConfirmar.mensaje}
            </p>
            <div style={{ ...s.formBotones, justifyContent: 'center' }}>
              <button style={s.btnCancelarModal} onClick={() => setModalConfirmar(null)}>Cancelar</button>
              <button style={s.btnConfirmar} onClick={() => { modalConfirmar.onConfirmar(); setModalConfirmar(null); }}>
                Confirmar
              </button>
            </div>
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
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: {
    width: '38px', height: '38px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
  },
  navTitle: { color: '#fff', fontSize: '20px', fontWeight: '800' },
  adminBadge: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.35)',
    color: '#fff', fontSize: '11px', fontWeight: '700',
    padding: '3px 12px', borderRadius: '20px',
  },
  btnLogout: {
    padding: '9px 20px',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '20px', fontSize: '14px', cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
  layout: { display: 'flex', minHeight: 'calc(100vh - 57px)' },
  sidebar: {
    width: '220px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.15)',
    padding: '24px 14px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  sidebarBtn: {
    padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    cursor: 'pointer', textAlign: 'left',
    fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s',
  },
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  loading: { color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  titulo: {
    fontSize: '26px', fontWeight: '800', color: '#fff',
    margin: '0 0 24px', textShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' },
  statCard: {
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
    padding: '20px', textAlign: 'center',
  },
  statNum: { fontSize: '32px', fontWeight: '800', color: '#fff', margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  statLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0 },
  tabla: {
    background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', overflow: 'hidden',
  },
  tablaHeader: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
    padding: '14px 20px',
    background: 'rgba(255,255,255,0.08)',
    fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  tablaFila: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    alignItems: 'center', fontSize: '14px',
  },
  tablaCell: { color: 'rgba(255,255,255,0.85)' },
  accionesCell: { display: 'flex', gap: '6px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  btnCompletar: {
    padding: '6px 10px',
    background: 'rgba(100,255,180,0.15)',
    border: '1px solid rgba(100,255,180,0.35)',
    borderRadius: '8px', color: '#6fffc0', fontSize: '13px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: '700',
  },
  btnCancelar: {
    padding: '6px 10px',
    background: 'rgba(255,100,100,0.15)',
    border: '1px solid rgba(255,100,100,0.35)',
    borderRadius: '8px', color: '#ffaaaa', fontSize: '12px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: '600',
  },
  seccionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  btnAgregar: {
    padding: '10px 22px',
    background: 'rgba(255,255,255,0.9)', color: '#0a4f7a',
    border: 'none', borderRadius: '20px', fontSize: '14px',
    fontWeight: '800', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  barberoCard: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px',
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
  },
  barberoAvatar: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '800', color: '#fff', flexShrink: 0,
    overflow: 'hidden',
  },
  barberoFoto: { width: '48px', height: '48px', objectFit: 'cover' },
  barberoInfo: { flex: 1 },
  barberoNombre: { fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 2px' },
  barberoEsp: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 2px' },
  barberoDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 },
  barberoAcciones: { display: 'flex', gap: '8px', flexShrink: 0 },
  btnEditar: {
    padding: '8px 16px',
    background: 'rgba(100,150,255,0.15)',
    border: '1px solid rgba(100,150,255,0.35)',
    borderRadius: '10px', color: '#aac4ff', fontSize: '13px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: '600',
  },
  btnEliminar: {
    padding: '8px 16px',
    background: 'rgba(255,100,100,0.15)',
    border: '1px solid rgba(255,100,100,0.35)',
    borderRadius: '10px', color: '#ffaaaa', fontSize: '13px',
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'rgba(10,50,80,0.95)', backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px',
    padding: '36px 32px', width: '100%', maxWidth: '560px',
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
    color: '#fff', fontSize: '14px', outline: 'none',
    fontFamily: "'Nunito', sans-serif",
  },
  formBotones: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  btnCancelarModal: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px', color: 'rgba(255,255,255,0.8)',
    fontSize: '14px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
  },
  btnConfirmar: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none', borderRadius: '12px', color: '#0a4f7a',
    fontSize: '14px', fontWeight: '800', cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  },
};
