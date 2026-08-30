import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshPromiseRef = useRef(null);

  const api = useMemo(() => axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }), []);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config || {};
        const isAuthRequest = String(originalRequest.url || '').includes('/auth/login') || String(originalRequest.url || '').includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
          originalRequest._retry = true;
          try {
            if (!refreshPromiseRef.current) {
              const refreshToken = localStorage.getItem('refreshToken');
              if (!refreshToken) throw new Error('No refresh token');
              refreshPromiseRef.current = axios.post(`${API_URL}/auth/refresh`, { refreshToken })
                .then(response => {
                  const { token, refreshToken: newRefreshToken } = response.data;
                  if (!token) throw new Error('Invalid refresh response');
                  localStorage.setItem('token', token);
                  if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
                  return token;
                })
                .finally(() => { refreshPromiseRef.current = null; });
            }
            const token = await refreshPromiseRef.current;
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
            if (window.location.pathname !== '/login') navigate('/login', { replace: true });
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [api, navigate]);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (mounted) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      if (mounted) setLoading(false);
    };
    checkAuth();
    return () => { mounted = false; };
  }, [api]);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setUser(user); setIsAuthenticated(true);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async userData => {
    try {
      const response = await api.post('/auth/register', { ...userData, email: undefined });
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setUser(user); setIsAuthenticated(true);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const updateProfile = async profileData => {
    try {
      const response = await api.put('/users/profile', profileData);
      if (response.data?.user) setUser(response.data.user);
      return response.data;
    } catch (error) { throw new Error(error.response?.data?.error || 'Failed to update profile'); }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try { return (await api.put('/users/password', { currentPassword, newPassword })).data; }
    catch (error) { throw new Error(error.response?.data?.error || 'Failed to change password'); }
  };

  const logout = ({ silent = false } = {}) => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null); setIsAuthenticated(false);
    if (!silent) toast.success('Logged out successfully');
    navigate('/');
  };

  return <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, updateProfile, updatePassword, logout, api }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
