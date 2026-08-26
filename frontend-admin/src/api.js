import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');
if (!API_URL) throw new Error('VITE_API_URL is required for production frontend-admin deployment');

export const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' }, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('employee_token') || localStorage.getItem('token');
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
    const originalRequest = error.config || {};
    if (error.response?.status !== 401 || originalRequest._retry || String(originalRequest.url || '').includes('/auth/refresh')) return Promise.reject(error);
    const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('employee_refresh_token');
    if (!refreshToken) {
      localStorage.removeItem('employee_token');
      localStorage.removeItem('token');
      localStorage.removeItem('employee_user');
      if (location.pathname !== '/login') location.assign('/login');
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
      refreshPromise ||= axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 30000 });
      const response = await refreshPromise;
      refreshPromise = null;
      const token = response.data?.token || response.data?.accessToken;
      const nextRefreshToken = response.data?.refreshToken || refreshToken;
      if (!token) throw new Error('Refresh response did not contain an access token');
      localStorage.setItem('employee_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', nextRefreshToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      localStorage.removeItem('employee_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('employee_user');
      if (location.pathname !== '/login') location.assign('/login');
      return Promise.reject(refreshError);
    }
  }
);

export const integrationApi = {
  status: () => api.get('/integration/status'),
};

export default api;
