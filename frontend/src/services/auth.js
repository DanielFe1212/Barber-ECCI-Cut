import api from './api';

export const registro = async (datos) => {
  const response = await api.post('/usuarios/registro/', datos);
  return response.data;
};

export const login = async (datos) => {
  const response = await api.post('/usuarios/login/', datos);
  localStorage.setItem('access', response.data.access);
  localStorage.setItem('refresh', response.data.refresh);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};