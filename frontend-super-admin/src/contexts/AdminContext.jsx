import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AdminContext = createContext();
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};

export const AdminProvider = ({ children }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);

  const request = async (method, url, data, successMessage, errorMessage, config) => {
    setLoading(true);
    try {
      const response = await api.request({ method, url, data, ...config });
      if (successMessage) toast.success(successMessage);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Players
  const getUsers = (params = {}) => request('get', '/admin/users', undefined, null, 'Failed to load users', { params });
  const getUserDetails = id => request('get', `/admin/users/${id}`, undefined, null, 'Failed to load user details');
  const updateUserStatus = (id, status) => request('put', `/admin/users/${id}/status`, { status }, 'User status updated', 'Failed to update user status');
  const adjustUserBalance = (id, amount, type = 'adjustment') => request('post', `/admin/users/${id}/balance`, { amount, type }, 'Balance adjusted', 'Failed to adjust balance');
  const deleteUser = (id, reason = '') => request('delete', `/admin/users/${id}`, { reason }, 'User deleted', 'Failed to delete user');

  // Slotopol game catalog. Game outcome manipulation is intentionally not exposed here.
  const getGames = (params = {}) => request('get', '/games/available', undefined, null, 'Failed to load Slotopol games', { params });
  const addGame = data => request('post', '/admin/games', data, 'Game metadata added', 'Failed to add game');
  const updateGame = (id, data) => request('put', `/admin/games/${id}`, data, 'Game updated', 'Failed to update game');
  const deleteGame = id => request('delete', `/admin/games/${id}`, undefined, 'Game deactivated', 'Failed to deactivate game');

  // Transactions / settlement
  const getTransactions = (params = {}) => request('get', '/admin/transactions', undefined, null, 'Failed to load transactions', { params });
  const approveTransaction = id => request('put', `/admin/transactions/${id}/approve`, undefined, 'Transaction approved', 'Failed to approve transaction');
  const rejectTransaction = (id, reason = '') => request('put', `/admin/transactions/${id}/reject`, { reason }, 'Transaction rejected', 'Failed to reject transaction');

  // Content
  const getPromotions = () => request('get', '/admin/promotions', undefined, null, 'Failed to load promotions');
  const addPromotion = data => request('post', '/admin/promotions', data, 'Promotion added', 'Failed to add promotion');
  const updatePromotion = (id, data) => request('put', `/admin/promotions/${id}`, data, 'Promotion updated', 'Failed to update promotion');
  const deletePromotion = id => request('delete', `/admin/promotions/${id}`, undefined, 'Promotion deleted', 'Failed to delete promotion');

  const getBanners = () => request('get', '/admin/banners', undefined, null, 'Failed to load banners');
  const addBanner = data => request('post', '/admin/banners', data, 'Banner added', 'Failed to add banner');
  const updateBanner = (id, data) => request('put', `/admin/banners/${id}`, data, 'Banner updated', 'Failed to update banner');
  const deleteBanner = id => request('delete', `/admin/banners/${id}`, undefined, 'Banner deleted', 'Failed to delete banner');

  // Platform configuration
  const getLanguages = () => request('get', '/admin/languages', undefined, null, 'Failed to load languages');
  const updateLanguage = (code, translations) => request('put', `/admin/languages/${code}`, { translations }, 'Language updated', 'Failed to update language');
  const getSettings = category => request('get', `/admin/settings/${category}`, undefined, null, 'Failed to load settings');
  const updateSettings = (category, settings) => request('put', `/admin/settings/${category}`, settings, 'Settings updated', 'Failed to update settings');

  // Support
  const getSupportMessages = () => request('get', '/admin/support/messages', undefined, null, 'Failed to load messages');
  const sendSupportReply = (userId, message) => request('post', '/admin/support/reply', { userId, message }, 'Reply sent', 'Failed to send reply');
  const resolveSupportTicket = id => request('put', `/admin/support/resolve/${id}`, undefined, 'Ticket resolved', 'Failed to resolve ticket');

  const getDashboardStats = useCallback(
    () => request('get', '/admin/dashboard/stats', undefined, null, 'Failed to load dashboard stats'),
    [api]
  );

  const value = {
    loading,
    getUsers, getUserDetails, updateUserStatus, adjustUserBalance, deleteUser,
    getGames, addGame, updateGame, deleteGame,
    getTransactions, approveTransaction, rejectTransaction,
    getPromotions, addPromotion, updatePromotion, deletePromotion,
    getBanners, addBanner, updateBanner, deleteBanner,
    getLanguages, updateLanguage, getSettings, updateSettings,
    getSupportMessages, sendSupportReply, resolveSupportTicket,
    getDashboardStats
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
