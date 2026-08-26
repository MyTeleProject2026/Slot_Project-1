import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'https://testing-backend-deploy-epvl.onrender.com/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      refreshPromise ||= axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const response = await refreshPromise;
      refreshPromise = null;
      const token = response.data?.token;
      const nextRefreshToken = response.data?.refreshToken || refreshToken;
      if (!token) throw new Error('Refresh response did not contain a token');
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', nextRefreshToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default api;
