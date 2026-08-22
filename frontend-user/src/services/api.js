import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');
if (!API_URL) {
  throw new Error('VITE_API_URL is required for production frontend deployment');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    if (!config.headers) {
      config.headers = {};
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and rate limiting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- Rate limiting (429) with exponential backoff ---
    if (error.response?.status === 429) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const maxRetries = 3;
      if (originalRequest._retryCount > maxRetries) {
        console.error('Max retries reached for 429');
        return Promise.reject(error);
      }
      const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount), 30000);
      console.warn(`Rate limit hit, retry ${originalRequest._retryCount} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    // --- Unauthorized (401) – refresh token ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
