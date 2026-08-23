import api from './api';

export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }).then(res => res.data),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`).then(res => res.data),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }).then(res => res.data),
  adjustUserBalance: (userId, amount, type) => api.post(`/admin/users/${userId}/balance`, { amount, type }).then(res => res.data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`).then(res => res.data),

  // Provider catalogue: use the same club-scoped source as frontend-user.
  getGames: (params) => api.get('/games/available', { params }).then(res => ({ ...res.data, games: res.data?.games || res.data?.data?.games || [] })),
  addGame: (data) => api.post('/admin/games', data).then(res => res.data),
  updateGame: (gameId, data) => api.put(`/admin/games/${gameId}`, data).then(res => res.data),
  updateGameRTP: (gameId, rtp) => api.put(`/admin/games/${gameId}/rtp`, { rtp }).then(res => res.data),
  updateGameWinRate: (gameId, winRate) => api.put(`/admin/games/${gameId}/win-rate`, { winRate }).then(res => res.data),
  deleteGame: (gameId) => api.delete(`/admin/games/${gameId}`).then(res => res.data),

  getTransactions: (params) => api.get('/admin/transactions', { params }).then(res => res.data),
  approveTransaction: (transactionId) => api.put(`/admin/transactions/${transactionId}/approve`).then(res => res.data),
  rejectTransaction: (transactionId, reason) => api.put(`/admin/transactions/${transactionId}/reject`, { reason }).then(res => res.data),
  getPromotions: () => api.get('/admin/promotions').then(res => res.data),
  addPromotion: (data) => api.post('/admin/promotions', data).then(res => res.data),
  updatePromotion: (promotionId, data) => api.put(`/admin/promotions/${promotionId}`, data).then(res => res.data),
  deletePromotion: (promotionId) => api.delete(`/admin/promotions/${promotionId}`).then(res => res.data),
  getBanners: () => api.get('/admin/banners').then(res => res.data),
  addBanner: (data) => api.post('/admin/banners', data).then(res => res.data),
  updateBanner: (bannerId, data) => api.put(`/admin/banners/${bannerId}`, data).then(res => res.data),
  deleteBanner: (bannerId) => api.delete(`/admin/banners/${bannerId}`).then(res => res.data),
  getLanguages: () => api.get('/admin/languages').then(res => res.data),
  updateLanguage: (code, translations) => api.put(`/admin/languages/${code}`, { translations }).then(res => res.data),
  getSettings: (category) => api.get(`/admin/settings/${category}`).then(res => res.data),
  updateSettings: (category, settings) => api.put(`/admin/settings/${category}`, settings).then(res => res.data),
  getSupportMessages: () => api.get('/admin/support/messages').then(res => res.data),
  sendSupportReply: (userId, message) => api.post('/admin/support/reply', { userId, message }).then(res => res.data),
  resolveSupportTicket: (messageId) => api.put(`/admin/support/resolve/${messageId}`).then(res => res.data),
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(res => res.data),
};
export default adminService;
