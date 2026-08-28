import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');
if (!API_URL) throw new Error('VITE_API_URL is required for production frontend-user deployment');

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;
const retryTimers = new WeakMap();

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Back off on rate limiting without retrying indefinitely.
    if (error.response?.status === 429) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= 3) {
        const delay = Math.min(1000 * (2 ** originalRequest._retryCount), 30000);
        retryTimers.set(originalRequest, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    // A refresh request must never recursively trigger another refresh.
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      String(originalRequest.url || '').includes('/auth/refresh')
    ) return Promise.reject(error);

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('token');
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 30000 })
          .finally(() => { refreshPromise = null; });
      }

      const response = await refreshPromise;
      const token = response.data?.token || response.data?.accessToken;
      const nextRefreshToken = response.data?.refreshToken || refreshToken;
      if (!token) throw new Error('Refresh response did not contain an access token');

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', nextRefreshToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;
