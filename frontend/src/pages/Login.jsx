import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/citas');
    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>✂</div>
          <h1 style={styles.brandName}>Barber Ecci Cut</h1>
          <p style={styles.brandSlogan}>Tu estilo, tu identidad</p>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.titulo}>Bienvenido de nuevo</h2>
          <p style={styles.subtitulo}>Inicia sesión para gestionar tus citas</p>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario</label>
              <input
                style={styles.input}
                type="text"
                name="username"
                placeholder="Tu nombre de usuario"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button style={{
              ...styles.boton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }} type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>o</span>
            <span style={styles.dividerLine}></span>
          </div>

          <p style={styles.registerLink}>
            ¿No tienes cuenta?{' '}
            <span style={styles.link} onClick={() => navigate('/registro')}>
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', sans-serif",
  },
  left: {
    flex: 1,
    background: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  brand: {
    textAlign: 'center',
    color: '#fff',
  },
  logo: {
    fontSize: '72px',
    marginBottom: '16px',
    display: 'block',
  },
  brandName: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#c8a96e',
    margin: '0 0 8px 0',
    letterSpacing: '1px',
  },
  brandSlogan: {
    fontSize: '16px',
    color: '#aaa',
    margin: 0,
    fontStyle: 'italic',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f0',
    padding: '40px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  titulo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  subtitulo: {
    fontSize: '15px',
    color: '#888',
    margin: '0 0 32px 0',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    letterSpacing: '0.3px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '15px',
    color: '#1a1a1a',
    outline: 'none',
    background: '#fafafa',
  },
  boton: {
    padding: '14px',
    background: '#c8a96e',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '8px',
    letterSpacing: '0.3px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '28px 0 20px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e0e0e0',
    display: 'block',
  },
  dividerText: {
    color: '#aaa',
    fontSize: '13px',
  },
  registerLink: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  link: {
    color: '#c8a96e',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};