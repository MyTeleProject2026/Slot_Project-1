import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const SUPER_ADMIN_ACCESS = 1 << 4;

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const normalizeAuth = (data) => {
  const token = data?.access || data?.token;
  const refreshToken = data?.refrsh || data?.refreshToken;
  const uid = data?.uid ?? data?.user?.uid;
  const user = data?.user || (uid ? { uid, email: data.email, name: data.name, role: 'super_admin' } : null);
  return { token, refreshToken, user };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authGeneration = useRef(0);
  const refreshPromise = useRef(null);

  const clearSession = useCallback(() => {
    authGeneration.current += 1;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
      if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes('/refresh')) return Promise.reject(error);
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearSession();
        navigate('/login', { replace: true });
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        if (!refreshPromise.current) {
          refreshPromise.current = axios.post(`${API_URL}/refresh`, {}, { headers: { Authorization: `Bearer ${refreshToken}` }, timeout: 15000 })
            .then((response) => normalizeAuth(response.data))
            .finally(() => { refreshPromise.current = null; });
        }
        const refreshed = await refreshPromise.current;
        if (!refreshed.token) throw new Error('Refresh response did not contain an access token');
        localStorage.setItem('token', refreshed.token);
        if (refreshed.refreshToken) localStorage.setItem('refreshToken', refreshed.refreshToken);
        originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${refreshed.token}` };
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
    const generationAtStart = authGeneration.current;
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { if (active) setLoading(false); return; }
      try {
        const response = await api.get('/auth/me');
        const userData = response.data?.user;
        if (!userData || (userData.role !== 'super_admin' && !(Number(userData.access || 0) & SUPER_ADMIN_ACCESS))) throw new Error('Super Admin access required');
        if (active && authGeneration.current === generationAtStart) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (!active || authGeneration.current !== generationAtStart) return;
        clearSession();
        if (error.message === 'Super Admin access required') toast.error(error.message);
      } finally {
        if (active && authGeneration.current === generationAtStart) setLoading(false);
      }
    };
    checkAuth();
    return () => { active = false; };
  }, [api, clearSession]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/signin', { email: username.trim().toLowerCase(), secret: password });
      const data = normalizeAuth(response.data);
      if (!data.token || !data.user) throw new Error('Invalid authentication response from Slotopol-server.');
      authGeneration.current += 1;
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      const authenticatedUser = { ...data.user, role: data.user.role || 'super_admin' };
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      setLoading(false);
      toast.success('Signed in successfully.');
      return { success: true, user: authenticatedUser };
    } catch (error) {
      const body = error.response?.data;
      const message = body?.error?.what || body?.error || body?.message || error.message || 'Login failed.';
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
