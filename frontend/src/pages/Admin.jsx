import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Admin() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState('citas');
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormBarbero, setMostrarFormBarbero] = useState(false);
  const [formBarbero, setFormBarbero] = useState({ nombre: '', especialidad: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

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
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarBarbero = async (e) => {
    e.preventDefault();
    try {
      await api.post('/barberos/', formBarbero);
      setMostrarFormBarbero(false);
      setFormBarbero({ nombre: '', especialidad: '' });
      cargarDatos();
    } catch (err) {
      setError('Error al agregar barbero.');
    }
  };

  const handleEliminarBarbero = async (id) => {
    if (!window.confirm('¿Eliminar este barbero?')) return;
    try {
      await api.delete(`/barberos/${id}/`);
      cargarDatos();
    } catch (err) {
      setError('Error al eliminar barbero.');
    }
  };

  const handleCancelarCita = async (id) => {
    if (!window.confirm('¿Cancelar esta cita?')) return;
    try {
      await api.post(`/citas/${id}/cancelar/`);
      cargarDatos();
    } catch (err) {
      setError('Error al cancelar la cita.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  const estadoColor = (estado) => {
    if (estado === 'pendiente') return { bg: '#fff8e6', color: '#b8860b', border: '#f0d080' };
    if (estado === 'completada') return { bg: '#e6f9f0', color: '#1a7a4a', border: '#80dba8' };
    return { bg: '#fef0f0', color: '#cc3333', border: '#f0a0a0' };
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>✂</span>
          <span style={styles.navTitle}>Barber Ecci Cut</span>
          <span style={styles.adminBadge}>Admin</span>
        </div>
        <button style={styles.btnLogout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </nav>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {[
            { key: 'citas', label: '📅 Citas' },
            { key: 'barberos', label: '✂ Barberos' },
            { key: 'usuarios', label: '👤 Usuarios' },
          ].map((item) => (
            <button
              key={item.key}
              style={{
                ...styles.sidebarBtn,
                background: seccion === item.key ? '#c8a96e' : 'transparent',
                color: seccion === item.key ? '#1a1a1a' : '#aaa',
                fontWeight: seccion === item.key ? '700' : '400',
              }}
              onClick={() => setSeccion(item.key)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* Contenido */}
        <main style={styles.main}>
          {error && <div style={styles.errorBox}>⚠ {error}</div>}

          {loading ? (
            <p style={styles.loading}>Cargando...</p>
          ) : (
            <>
              {/* SECCIÓN CITAS */}
              {seccion === 'citas' && (
                <div>
                  <h2 style={styles.titulo}>Gestión de Citas</h2>
                  <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                      <p style={styles.statNum}>{citas.length}</p>
                      <p style={styles.statLabel}>Total citas</p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statNum}>{citas.filter(c => c.estado === 'pendiente').length}</p>
                      <p style={styles.statLabel}>Pendientes</p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statNum}>{citas.filter(c => c.estado === 'cancelada').length}</p>
                      <p style={styles.statLabel}>Canceladas</p>
                    </div>
                    <div style={styles.statCard}>
                      <p style={styles.statNum}>{citas.filter(c => c.estado === 'completada').length}</p>
                      <p style={styles.statLabel}>Completadas</p>
                    </div>
                  </div>

                  <div style={styles.tabla}>
                    <div style={styles.tablaHeader}>
                      <span>Usuario</span>
                      <span>Barbero</span>
                      <span>Fecha</span>
                      <span>Hora</span>
                      <span>Estado</span>
                      <span>Acción</span>
                    </div>
                    {citas.map((cita) => {
                      const colores = estadoColor(cita.estado);
                      return (
                        <div key={cita.id} style={styles.tablaFila}>
                          <span style={styles.tablaCell}>#{cita.usuario}</span>
                          <span style={styles.tablaCell}>
                            {barberos.find(b => b.id === cita.barbero)?.nombre || '—'}
                          </span>
                          <span style={styles.tablaCell}>{cita.fecha}</span>
                          <span style={styles.tablaCell}>{cita.hora}</span>
                          <span>
                            <span style={{
                              ...styles.badge,
                              background: colores.bg,
                              color: colores.color,
                              border: `1px solid ${colores.border}`,
                            }}>
                              {cita.estado}
                            </span>
                          </span>
                          <span>
                            {cita.estado === 'pendiente' && (
                              <button
                                style={styles.btnCancelar}
                                onClick={() => handleCancelarCita(cita.id)}
                              >
                                Cancelar
                              </button>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECCIÓN BARBEROS */}
              {seccion === 'barberos' && (
                <div>
                  <div style={styles.seccionHeader}>
                    <h2 style={styles.titulo}>Gestión de Barberos</h2>
                    <button style={styles.btnAgregar} onClick={() => setMostrarFormBarbero(true)}>
                      + Agregar barbero
                    </button>
                  </div>

                  {mostrarFormBarbero && (
                    <div style={styles.formCard}>
                      <h3 style={styles.formTitulo}>Nuevo barbero</h3>
                      <form onSubmit={handleAgregarBarbero} style={styles.form}>
                        <div style={styles.formRow}>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Nombre</label>
                            <input
                              style={styles.input}
                              type="text"
                              placeholder="Nombre del barbero"
                              value={formBarbero.nombre}
                              onChange={(e) => setFormBarbero({ ...formBarbero, nombre: e.target.value })}
                              required
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Especialidad</label>
                            <input
                              style={styles.input}
                              type="text"
                              placeholder="Ej: Corte clásico"
                              value={formBarbero.especialidad}
                              onChange={(e) => setFormBarbero({ ...formBarbero, especialidad: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div style={styles.formBotones}>
                          <button type="button" style={styles.btnCancelarModal} onClick={() => setMostrarFormBarbero(false)}>
                            Cancelar
                          </button>
                          <button type="submit" style={styles.btnConfirmar}>
                            Guardar barbero
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div style={styles.grid}>
                    {barberos.map((barbero) => (
                      <div key={barbero.id} style={styles.barberoCard}>
                        <div style={styles.barberoAvatar}>
                          {barbero.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.barberoInfo}>
                          <p style={styles.barberoNombre}>{barbero.nombre}</p>
                          <p style={styles.barberoEsp}>{barbero.especialidad}</p>
                        </div>
                        <button
                          style={styles.btnEliminar}
                          onClick={() => handleEliminarBarbero(barbero.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN USUARIOS */}
              {seccion === 'usuarios' && (
                <div>
                  <h2 style={styles.titulo}>Gestión de Usuarios</h2>
                  <div style={styles.tabla}>
                    <div style={styles.tablaHeader}>
                      <span>ID</span>
                      <span>Usuario</span>
                      <span>Email</span>
                      <span>Rol</span>
                    </div>
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} style={styles.tablaFila}>
                        <span style={styles.tablaCell}>#{usuario.id}</span>
                        <span style={styles.tablaCell}>{usuario.username}</span>
                        <span style={styles.tablaCell}>{usuario.email}</span>
                        <span>
                          <span style={{
                            ...styles.badge,
                            background: usuario.rol === 'admin' ? '#e6f0ff' : '#f0f0f0',
                            color: usuario.rol === 'admin' ? '#1a4fa0' : '#444',
                            border: usuario.rol === 'admin' ? '1px solid #a0b8f0' : '1px solid #ddd',
                          }}>
                            {usuario.rol}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f0',
    fontFamily: "'Segoe UI', sans-serif",
  },
  navbar: {
    background: '#1a1a1a',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogo: { fontSize: '24px' },
  navTitle: {
    color: '#c8a96e',
    fontSize: '20px',
    fontWeight: '700',
  },
  adminBadge: {
    background: '#c8a96e',
    color: '#1a1a1a',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  btnLogout: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#aaa',
    border: '1px solid #444',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 57px)',
  },
  sidebar: {
    width: '220px',
    background: '#1a1a1a',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarBtn: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    padding: '32px',
  },
  errorBox: {
    background: '#fff0f0',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#cc3333',
    fontSize: '14px',
  },
  loading: { color: '#888', textAlign: 'center' },
  titulo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 24px 0',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #eee',
  },
  statNum: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#c8a96e',
    margin: '0 0 4px 0',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  tabla: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #eee',
    overflow: 'hidden',
  },
  tablaHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    padding: '14px 20px',
    background: '#f8f8f5',
    fontSize: '12px',
    fontWeight: '700',
    color: '#888',
    borderBottom: '1px solid #eee',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tablaFila: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center',
    fontSize: '14px',
  },
  tablaCell: { color: '#333' },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  btnCancelar: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid #ffcccc',
    borderRadius: '6px',
    color: '#cc3333',
    fontSize: '12px',
    cursor: 'pointer',
  },
  seccionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  btnAgregar: {
    padding: '10px 20px',
    background: '#c8a96e',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  formCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #eee',
  },
  formTitulo: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    background: '#fafafa',
    color: '#1a1a1a',
    outline: 'none',
  },
  formBotones: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  btnCancelarModal: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
  },
  btnConfirmar: {
    padding: '10px 20px',
    background: '#c8a96e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
  },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  barberoCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  barberoAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#c8a96e',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  barberoInfo: { flex: 1 },
  barberoNombre: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' },
  barberoEsp: { fontSize: '13px', color: '#888', margin: 0 },
  btnEliminar: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    color: '#cc3333',
    fontSize: '13px',
    cursor: 'pointer',
  },
};