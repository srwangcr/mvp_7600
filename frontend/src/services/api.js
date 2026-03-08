import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ====================================
// SERVICIOS DE API
// ====================================

// Autenticación
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateMe: (userData) => api.put('/auth/me', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords)
};

// Casos
export const casosService = {
  getCasos: (params) => api.get('/casos', { params }),
  getCaso: (id) => api.get(`/casos/${id}`),
  createCaso: (formData) => api.post('/casos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCaso: (id, formData) => api.put(`/casos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCaso: (id) => api.delete(`/casos/${id}`),
  getMisCasos: () => api.get('/casos/mis-casos/list'),
  aprobarCaso: (id) => api.post(`/casos/${id}/aprobar`),
  rechazarCaso: (id, razon) => api.post(`/casos/${id}/rechazar`, { razon }),
  completarCaso: (id) => api.post(`/casos/${id}/completar`),
  getCasosParaMapa: () => api.get('/casos/mapa/todos')
};

// Reportes
export const reportesService = {
  getReportes: (params) => api.get('/reportes', { params }),
  getReporte: (id) => api.get(`/reportes/${id}`),
  createReporte: (formData) => api.post('/reportes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateReporte: (id, formData) => api.put(`/reportes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteReporte: (id) => api.delete(`/reportes/${id}`),
  getMisReportes: () => api.get('/reportes/mis-reportes/list'),
  aprobarReporte: (id) => api.post(`/reportes/${id}/aprobar`),
  asignarReporte: (id, autoridadId) => api.post(`/reportes/${id}/asignar`, { autoridad_id: autoridadId }),
  resolverReporte: (id) => api.post(`/reportes/${id}/resolver`),
  agregarNotas: (id, notas) => api.post(`/reportes/${id}/notas`, { notas }),
  getReportesParaMapa: () => api.get('/reportes/mapa/todos')
};

// Donaciones
export const donacionesService = {
  getDonacionesByCaso: (casoId) => api.get(`/donaciones/caso/${casoId}`),
  createDonacion: (formData) => api.post('/donaciones', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMisDonaciones: () => api.get('/donaciones/mis-donaciones/list'),
  getDonacionesRecibidas: () => api.get('/donaciones/recibidas/list'),
  verificarDonacion: (id) => api.post(`/donaciones/${id}/verificar`),
  rechazarDonacion: (id) => api.post(`/donaciones/${id}/rechazar`),
  getDonacionesPendientes: () => api.get('/donaciones/pendientes/list')
};

// Notificaciones
export const notificacionesService = {
  getNotificaciones: () => api.get('/notificaciones'),
  getNoLeidasCount: () => api.get('/notificaciones/no-leidas/count'),
  marcarComoLeida: (id) => api.put(`/notificaciones/${id}/leer`),
  marcarTodasComoLeidas: () => api.put('/notificaciones/leer-todas/action'),
  deleteNotificacion: (id) => api.delete(`/notificaciones/${id}`)
};

// Admin
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsuarios: (params) => api.get('/admin/usuarios', { params }),
  cambiarRolUsuario: (id, rol) => api.put(`/admin/usuarios/${id}/rol`, { rol }),
  toggleUsuarioActivo: (id) => api.put(`/admin/usuarios/${id}/toggle-activo`),
  getCasosPendientes: () => api.get('/admin/casos-pendientes'),
  getReportesPendientes: () => api.get('/admin/reportes-pendientes'),
  getDonacionesPendientes: () => api.get('/admin/donaciones-pendientes'),
  getEstadisticas: () => api.get('/admin/estadisticas')
};

export default api;
