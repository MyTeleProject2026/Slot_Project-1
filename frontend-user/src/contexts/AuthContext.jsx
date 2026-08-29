import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); const [isAuthenticated, setIsAuthenticated] = useState(false); const [loading, setLoading] = useState(true); const navigate = useNavigate();
  const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
  api.interceptors.request.use(config => { const token = localStorage.getItem('token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; }, error => Promise.reject(error));
  api.interceptors.response.use(response => response, async error => { const originalRequest = error.config || {}; if (error.response?.status === 401 && !originalRequest._retry) { originalRequest._retry = true; try { const refreshToken = localStorage.getItem('refreshToken'); if (!refreshToken) throw new Error('No refresh token'); const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }); const { token, refreshToken: newRefreshToken } = response.data; localStorage.setItem('token', token); if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken); originalRequest.headers.Authorization = `Bearer ${token}`; return api(originalRequest); } catch (refreshError) { logout(); navigate('/login'); return Promise.reject(refreshError); } } return Promise.reject(error); });
  useEffect(() => { const checkAuth = async () => { const token = localStorage.getItem('token'); if (token) { try { const response = await api.get('/auth/me'); setUser(response.data.user); setIsAuthenticated(true); } catch { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); setUser(null); setIsAuthenticated(false); } } setLoading(false); }; checkAuth(); }, []);
  const login = async (identifier, password) => { try { const response = await api.post('/auth/login', { identifier, password }); const { token, refreshToken, user } = response.data; localStorage.setItem('token', token); localStorage.setItem('refreshToken', refreshToken); setUser(user); setIsAuthenticated(true); toast.success('Welcome back!'); return { success: true }; } catch (error) { const msg = error.response?.data?.error || 'Login failed'; toast.error(msg); throw new Error(msg); } };
  const register = async userData => { try { const response = await api.post('/auth/register', { ...userData, email: undefined }); const { token, refreshToken, user } = response.data; localStorage.setItem('token', token); localStorage.setItem('refreshToken', refreshToken); setUser(user); setIsAuthenticated(true); toast.success('Account created successfully!'); return { success: true }; } catch (error) { const msg = error.response?.data?.error || 'Registration failed'; toast.error(msg); throw new Error(msg); } };
  const updateProfile = async profileData => { try { const response = await api.put('/users/profile', profileData); if (response.data?.user) setUser(response.data.user); return response.data; } catch (error) { throw new Error(error.response?.data?.error || 'Failed to update profile'); } };
  const updatePassword = async (currentPassword, newPassword) => { try { const response = await api.put('/users/password', { currentPassword, newPassword }); return response.data; } catch (error) { throw new Error(error.response?.data?.error || 'Failed to change password'); } };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); setUser(null); setIsAuthenticated(false); toast.success('Logged out successfully'); navigate('/'); };
  return <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, updateProfile, updatePassword, logout, api }}>{children}</AuthContext.Provider>;
};
export default AuthContext;