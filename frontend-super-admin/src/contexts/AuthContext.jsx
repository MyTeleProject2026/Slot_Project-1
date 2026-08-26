import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const normalizeAuth = (data) => ({
  token: data?.token || data?.access,
  refreshToken: data?.refreshToken || data?.refrsh,
  user: data?.user || null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshPromise = useRef(null);
  const authGeneration = useRef(0);

  const clearSession = useCallback(() => {
    authGeneration.current += 1;
    ['token', 'refreshToken', 'user'].forEach((key) => localStorage.removeItem(key));
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
      const original = error.config || {};
      if (error.response?.status !== 401 || original._retry || original.url?.includes('/auth/refresh')) return Promise.reject(error);
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);
      original._retry = true;
      try {
        if (!refreshPromise.current) {
          refreshPromise.current = axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 })
            .then((response) => normalizeAuth(response.data))
            .finally(() => { refreshPromise.current = null; });
        }
        const refreshed = await refreshPromise.current;
        if (!refreshed.token) throw new Error('Refresh response did not contain an access token');
        localStorage.setItem('token', refreshed.token);
        if (refreshed.refreshToken) localStorage.setItem('refreshToken', refreshed.refreshToken);
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${refreshed.token}` };
        return instance(original);
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
    const generation = authGeneration.current;
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { if (active) setLoading(false); return; }
      try {
        const response = await api.get('/auth/me');
        const userData = response.data?.user;
        if (!userData || userData.role !== 'super_admin') throw new Error('Super Admin access required');
        if (active && authGeneration.current === generation) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (active && authGeneration.current === generation) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };
    checkAuth();
    return () => { active = false; };
  }, [api, clearSession]);

  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { identifier: identifier.trim(), password }, { timeout: 30000 });
      const data = normalizeAuth(response.data);
      if (!response.data?.success || !data.token || !data.user) throw new Error(response.data?.error || 'Invalid authentication response.');
      if (data.user.role !== 'super_admin') throw new Error('Super Admin access required');
      authGeneration.current += 1;
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
      toast.success('Signed in successfully.');
      return { success: true, user: data.user };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Login failed.';
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
