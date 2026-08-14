import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;
