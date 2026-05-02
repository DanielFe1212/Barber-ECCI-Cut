import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registro } from '../services/auth';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registro(form);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.username) setError('Ese nombre de usuario ya está en uso.');
      else if (data?.email) setError('Ese correo electrónico ya está registrado.');
      else if (data?.password) setError('La contraseña no cumple los requisitos mínimos.');
      else setError('Error al registrarse. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.logoCircle}>✂</div>
          <h1 style={s.brandName}>Barber Ecci Cut</h1>
          <p style={s.brandSlogan}>Tu estilo, tu identidad</p>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.glass}>
          <h2 style={s.titulo}>Crear cuenta</h2>
          <p style={s.subtitulo}>Regístrate para agendar tu cita</p>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.inputGroup}>
              <label style={s.label}>Usuario</label>
              <input
                style={s.input}
                type="text"
                name="username"
                placeholder="Ej: juan123"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Correo electrónico</label>
              <input
                style={s.input}
                type="email"
                name="email"
                placeholder="tucorreo@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Contraseña</label>
              <input
                style={s.input}
                type="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              style={{ ...s.boton, opacity: loading ? 0.7 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerText}>o</span>
            <span style={s.dividerLine} />
          </div>

          <p style={s.footerText}>
            ¿Ya tienes cuenta?{' '}
            <span style={s.link} onClick={() => navigate('/login')}>Inicia sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Nunito', sans-serif",
    background: 'linear-gradient(135deg, #0a4f7a 0%, #1a8a6e 50%, #2ec4b6 100%)',
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  brand: { textAlign: 'center', color: '#fff' },
  logoCircle: {
    width: '90px',
    height: '90px',
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto 20px',
    backdropFilter: 'blur(10px)',
  },
  brandName: {
    fontSize: '38px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 8px',
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  brandSlogan: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    margin: 0,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  glass: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  titulo: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 6px',
  },
  subtitulo: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 32px',
  },
  errorBox: {
    background: 'rgba(255,80,80,0.2)',
    border: '1px solid rgba(255,100,100,0.4)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#ffcccc',
    fontSize: '14px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  input: {
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    fontFamily: "'Nunito', sans-serif",
  },
  boton: {
    padding: '14px',
    background: 'rgba(255,255,255,0.9)',
    color: '#0a4f7a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '6px',
    fontFamily: "'Nunito', sans-serif",
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 18px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.2)',
    display: 'block',
  },
  dividerText: { color: 'rgba(255,255,255,0.5)', fontSize: '13px' },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  link: { color: '#fff', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
};
