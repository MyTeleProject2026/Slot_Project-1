import api from './api';

export const authService = {
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
