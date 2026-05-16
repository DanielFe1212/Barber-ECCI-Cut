import { useRef } from 'react';
import api from '../services/api';

export default function AvatarPerfil({ perfil, onActualizar, size = 34 }) {
  const inputRef = useRef(null);

  const handleSubir = async (e) => {
    const foto = e.target.files[0];
    if (!foto) return;
    const formData = new FormData();
    formData.append('foto', foto);
    try {
      const res = await api.post('/usuarios/perfil/foto/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onActualizar({ ...perfil, foto_perfil_url: res.data.foto_perfil_url });
    } catch {
      console.error('Error al subir foto de perfil');
    }
  };

  const handleQuitar = async (e) => {
    e.stopPropagation();
    try {
      await api.delete('/usuarios/perfil/foto/');
      onActualizar({ ...perfil, foto_perfil_url: null });
    } catch {
      console.error('Error al quitar foto de perfil');
    }
  };

  const letra = perfil?.username?.charAt(0).toUpperCase() || '?';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          overflow: 'hidden', cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.4)',
          flexShrink: 0,
        }}
        title="Cambiar foto de perfil"
        onClick={() => inputRef.current?.click()}
      >
        {perfil?.foto_perfil_url ? (
          <img
            src={perfil.foto_perfil_url}
            alt="perfil"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: '800', color: '#fff',
            fontFamily: "'Nunito', sans-serif",
          }}>
            {letra}
          </div>
        )}
      </div>

      {/* Botón quitar foto — solo si tiene foto */}
      {perfil?.foto_perfil_url && (
        <button
          style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'rgba(255,80,80,0.9)',
            border: 'none', color: '#fff',
            fontSize: 9, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, padding: 0,
          }}
          onClick={handleQuitar}
          title="Quitar foto"
        >
          ✕
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleSubir}
      />
    </div>
  );
}
