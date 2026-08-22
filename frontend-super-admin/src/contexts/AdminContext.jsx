import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);

  // ============================================================
  // USER MANAGEMENT
  // ============================================================
  
  const getUsers = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load users');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load user details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      toast.success('User status updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update user status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adjustUserBalance = async (userId, amount, type = 'adjustment') => {
    setLoading(true);
    try {
      const response = await api.post(`/admin/users/${userId}/balance`, { amount, type });
      toast.success('Balance adjusted');
      return response.data;
    } catch (error) {
      toast.error('Failed to adjust balance');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GAME MANAGEMENT
  // ============================================================
  
  const getGames = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/games', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load games');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addGame = async (gameData) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/games', gameData);
      toast.success('Game added successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to add game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (gameId, gameData) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/games/${gameId}`, gameData);
      toast.success('Game updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGameRTP = async (gameId, rtpValue) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/games/${gameId}/rtp`, { rtp: rtpValue });
      toast.success('Game RTP updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update RTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGameWinRate = async (gameId, winRate) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/games/${gameId}/win-rate`, { winRate });
      toast.success('Win rate updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update win rate');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/admin/games/${gameId}`);
      toast.success('Game deleted');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // TRANSACTION MANAGEMENT
  // ============================================================
  
  const getTransactions = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/admin/transactions', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load transactions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveTransaction = async (transactionId) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/approve`);
      toast.success('Transaction approved');
      return response.data;
    } catch (error) {
      toast.error('Failed to approve transaction');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectTransaction = async (transactionId, reason = '') => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/reject`, { reason });
      toast.success('Transaction rejected');
      return response.data;
    } catch (error) {
      toast.error('Failed to reject transaction');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PROMOTION MANAGEMENT
  // ============================================================
  
  const getPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/promotions');
      return response.data;
    } catch (error) {
      toast.error('Failed to load promotions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPromotion = async (promotionData) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/promotions', promotionData);
      toast.success('Promotion added');
      return response.data;
    } catch (error) {
      toast.error('Failed to add promotion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePromotion = async (promotionId, promotionData) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/promotions/${promotionId}`, promotionData);
      toast.success('Promotion updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update promotion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePromotion = async (promotionId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/admin/promotions/${promotionId}`);
      toast.success('Promotion deleted');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete promotion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // BANNER MANAGEMENT
  // ============================================================
  
  const getBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/banners');
      return response.data;
    } catch (error) {
      toast.error('Failed to load banners');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addBanner = async (bannerData) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/banners', bannerData);
      toast.success('Banner added');
      return response.data;
    } catch (error) {
      toast.error('Failed to add banner');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (bannerId, bannerData) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/banners/${bannerId}`, bannerData);
      toast.success('Banner updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update banner');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (bannerId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/admin/banners/${bannerId}`);
      toast.success('Banner deleted');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete banner');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LANGUAGE MANAGEMENT
  // ============================================================
  
  const getLanguages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/languages');
      return response.data;
    } catch (error) {
      toast.error('Failed to load languages');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (languageCode, translations) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/languages/${languageCode}`, { translations });
      toast.success('Language updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update language');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SETTINGS MANAGEMENT
  // ============================================================
  
  const getSettings = async (category) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/settings/${category}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (category, settings) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/settings/${category}`, settings);
      toast.success('Settings updated');
      return response.data;
    } catch (error) {
      toast.error('Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUPPORT CHAT
  // ============================================================
  
  const getSupportMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/support/messages');
      return response.data;
    } catch (error) {
      toast.error('Failed to load messages');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendSupportReply = async (userId, message) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/support/reply', { userId, message });
      toast.success('Reply sent');
      return response.data;
    } catch (error) {
      toast.error('Failed to send reply');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resolveSupportTicket = async (messageId) => {
    setLoading(true);
    try {
      const response = await api.put(`/admin/support/resolve/${messageId}`);
      toast.success('Ticket resolved');
      return response.data;
    } catch (error) {
      toast.error('Failed to resolve ticket');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DASHBOARD STATS
  // ============================================================
  
  const getDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      toast.error('Failed to load dashboard stats');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    // Users
    getUsers,
    getUserDetails,
    updateUserStatus,
    adjustUserBalance,
    deleteUser,
    // Games
    getGames,
    addGame,
    updateGame,
    updateGameRTP,
    updateGameWinRate,
    deleteGame,
    // Transactions
    getTransactions,
    approveTransaction,
    rejectTransaction,
    // Promotions
    getPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    // Banners
    getBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    // Languages
    getLanguages,
    updateLanguage,
    // Settings
    getSettings,
    updateSettings,
    // Support
    getSupportMessages,
    sendSupportReply,
    resolveSupportTicket,
    // Dashboard
    getDashboardStats,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
