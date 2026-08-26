import api from './api';

const normalize = (data = {}) => ({
  ...data,
  token: data.access || data.token,
  refreshToken: data.refrsh || data.refreshToken,
});

export const authService = {
  login: (credentials) => api.post('/signin', { email: credentials.email || credentials.username, secret: credentials.secret || credentials.password }).then(res => normalize(res.data)),
  refresh: (refreshToken) => api.post('/refresh', {}, { headers: { Authorization: `Bearer ${refreshToken}` } }).then(res => normalize(res.data)),
  getMe: () => api.get('/auth/me').then(res => res.data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;
