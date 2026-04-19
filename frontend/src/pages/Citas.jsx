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
  const [form, setForm] = useState({
    barbero: '',
    fecha: '',
    hora: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [citasRes, barberosRes] = await Promise.all([
        api.get('/citas/'),
        api.get('/barberos/'),
      ]);
      setCitas(citasRes.data);
      setBarberos(barberosRes.data);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        </div>
        <div style={styles.navActions}>
          <button style={styles.btnAgendar} onClick={() => setMostrarForm(true)}>
            + Nueva cita
          </button>
          <button style={styles.btnLogout} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div style={styles.contenido}>
        <h2 style={styles.titulo}>Mis citas</h2>

        {error && (
          <div style={styles.errorBox}>⚠ {error}</div>
        )}

        {/* Modal agendar */}
        {mostrarForm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitulo}>Agendar nueva cita</h3>

              <form onSubmit={handleAgendar} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Barbero</label>
                  <select
                    style={styles.input}
                    name="barbero"
                    value={form.barbero}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un barbero</option>
                    {barberos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre} — {b.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Fecha</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Hora</label>
                  <input
                    style={styles.input}
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={styles.modalBotones}>
                  <button
                    type="button"
                    style={styles.btnCancelarModal}
                    onClick={() => setMostrarForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnConfirmar}>
                    Confirmar cita
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de citas */}
        {loading ? (
          <p style={styles.loading}>Cargando citas...</p>
        ) : citas.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>📅</span>
            <p style={styles.emptyText}>No tienes citas agendadas</p>
            <button style={styles.btnAgendarEmpty} onClick={() => setMostrarForm(true)}>
              Agendar mi primera cita
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {citas.map((cita) => {
              const colores = estadoColor(cita.estado);
              return (
                <div key={cita.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <p style={styles.cardBarbero}>
                        ✂ {barberos.find(b => b.id === cita.barbero)?.nombre || 'Barbero'}
                      </p>
                      <p style={styles.cardFecha}>
                        📅 {cita.fecha} — 🕐 {cita.hora}
                      </p>
                    </div>
                    <span style={{
                      ...styles.badge,
                      background: colores.bg,
                      color: colores.color,
                      border: `1px solid ${colores.border}`,
                    }}>
                      {cita.estado}
                    </span>
                  </div>

                  {cita.estado === 'pendiente' && (
                    <button
                      style={styles.btnCancelarCita}
                      onClick={() => handleCancelar(cita.id)}
                    >
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogo: {
    fontSize: '24px',
  },
  navTitle: {
    color: '#c8a96e',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  navActions: {
    display: 'flex',
    gap: '12px',
  },
  btnAgendar: {
    padding: '10px 20px',
    background: '#c8a96e',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
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
  contenido: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  titulo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '24px',
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
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalTitulo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '15px',
    color: '#1a1a1a',
    background: '#fafafa',
    outline: 'none',
  },
  modalBotones: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  btnCancelarModal: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#666',
    cursor: 'pointer',
  },
  btnConfirmar: {
    flex: 1,
    padding: '12px',
    background: '#c8a96e',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    marginTop: '60px',
  },
  empty: {
    textAlign: 'center',
    marginTop: '80px',
  },
  emptyIcon: {
    fontSize: '48px',
  },
  emptyText: {
    color: '#888',
    fontSize: '16px',
    margin: '12px 0 24px',
  },
  btnAgendarEmpty: {
    padding: '12px 24px',
    background: '#c8a96e',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #eee',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBarbero: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  cardFecha: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  btnCancelarCita: {
    marginTop: '16px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #ffcccc',
    borderRadius: '8px',
    color: '#cc3333',
    fontSize: '13px',
    cursor: 'pointer',
  },
};