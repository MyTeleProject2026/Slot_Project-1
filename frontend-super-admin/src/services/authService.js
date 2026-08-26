import api from './api';

const unwrap = (response) => response?.data?.data || response?.data || {};

export const authService = {
  login: ({ identifier, email, username, password }) => {
    const value = identifier || email || username;
    return api.post('/auth/login', { identifier: value, password }).then((res) => unwrap(res));
  },
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then((res) => unwrap(res)),
  getMe: () => api.get('/auth/me').then((res) => unwrap(res)),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;
