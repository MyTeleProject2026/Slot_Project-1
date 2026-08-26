import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const SUPER_ADMIN_ROLES = new Set(['super_admin', 'main_admin']);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    instance.interceptors.response.use((response) => response, async (error) => {
      const originalRequest = error.config || {};
      if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) return Promise.reject(error);
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) { clearSession(); navigate('/login', { replace: true }); return Promise.reject(error); }
      try {
        const refreshed = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 });
        const token = refreshed.data?.token;
        if (!token) throw new Error('Refresh response did not contain a token');
        localStorage.setItem('token', token);
        originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${token}` };
        return instance(originalRequest);
      } catch (refreshError) {
        clearSession();
        navigate('/login', { replace: true });
        return Promise.reject(refreshError);
      }
    });
    return instance;
  }, [clearSession, navigate]);

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { if (active) setLoading(false); return; }
      try {
        const response = await api.get('/auth/me');
        const userData = response.data?.user;
        if (!userData || !SUPER_ADMIN_ROLES.has(userData.role)) throw new Error('Super Admin access required');
        if (active) { setUser(userData); setIsAuthenticated(true); }
      } catch (error) {
        clearSession();
        if (error.message === 'Super Admin access required') toast.error('Access denied. Super Admin privileges are required.');
      } finally { if (active) setLoading(false); }
    };
    checkAuth();
    return () => { active = false; };
  }, [api, clearSession]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data || {};
      const authenticatedUser = data.user;
      if (!data.token || !authenticatedUser) throw new Error('Invalid authentication response from server.');
      if (!SUPER_ADMIN_ROLES.has(authenticatedUser.role)) {
        clearSession();
        const message = 'Access denied. Super Admin privileges are required.';
        toast.error(message);
        return { success: false, error: message };
      }
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      toast.success('Signed in successfully.');
      return { success: true, user: authenticatedUser };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed.';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = useCallback(() => {
    clearSession();
    toast.success('Signed out.');
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  const value = useMemo(() => ({ user, isAuthenticated, loading, login, logout, api, apiUrl: API_URL }), [user, isAuthenticated, loading, api, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
