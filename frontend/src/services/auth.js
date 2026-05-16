import api from './api';

// Usamos sessionStorage para que cada pestaña tenga su propia sesión
const store = sessionStorage;

export const login = async ({ username, password }) => {
  const res = await api.post('/usuarios/login/', { username, password });
  store.setItem('access',  res.data.access);
  store.setItem('refresh', res.data.refresh);
  return res.data;
};

export const registro = async (data) => {
  const res = await api.post('/usuarios/registro/', data);
  return res.data;
};

export const logout = async () => {
  try {
    const refresh = store.getItem('refresh');
    if (refresh) await api.post('/usuarios/logout/', { refresh });
  } catch { /* continuar */ } finally {
    store.removeItem('access');
    store.removeItem('refresh');
  }
};

export const getAccess  = () => store.getItem('access');
export const getRefresh = () => store.getItem('refresh');
