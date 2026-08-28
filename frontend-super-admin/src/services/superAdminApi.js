import api from './api';

// Single API surface for the N999Bet owner console. Methods below map to
// authenticated backend routes. Sensitive game-outcome manipulation is
// intentionally not exposed from the owner UI.
const unwrap = (request) => request.then((response) => response?.data ?? response);

const superAdminApi = {
  me: () => unwrap(api.get('/auth/me')),
  logout: () => unwrap(api.post('/auth/logout')),
  refresh: (refreshToken) => unwrap(api.post('/auth/refresh', { refreshToken })),

  getAdmins: () => unwrap(api.get('/super-admin/admins')),
  createAdmin: (payload) => unwrap(api.post('/super-admin/admins', payload)),
  updateAdmin: (id, payload) => unwrap(api.put(`/super-admin/admins/${id}`, payload)),
  deleteAdmin: (id) => unwrap(api.delete(`/super-admin/admins/${id}`)),
  getAllAdmins: () => unwrap(api.get('/main-admin/all-admins')),
  getAdminAudit: () => unwrap(api.get('/main-admin/audit/admins')),

  getBalance: () => unwrap(api.get('/super-admin/balance')),
  getMasterBalance: () => unwrap(api.get('/slotopol-funding/balance')),
  getFundingOverview: () => unwrap(api.get('/slotopol-funding/overview')),
  addBalance: (payload) => unwrap(api.post('/super-admin/balance/add', payload)),
  transferBalance: (payload) => unwrap(api.post('/super-admin/balance/transfer', payload)),
  getFundingHistory: (params = {}) => unwrap(api.get('/slotopol-funding/history', { params })),
  getSettlementSummary: () => unwrap(api.get('/super-admin/transactions/summary')),
  getBalanceOverview: () => unwrap(api.get('/main-admin/balance/overview')),
  addBalanceToSuperAdmin: (payload) => unwrap(api.post('/main-admin/balance/add-to-super-admin', payload)),
  addBalanceToAdmin: (payload) => unwrap(api.post('/main-admin/balance/add-to-admin', payload)),

  getDashboardStats: () => unwrap(api.get('/admin/dashboard/stats')),
  getFullStats: () => unwrap(api.get('/main-admin/stats/full')),
  getAuditLogs: (params) => unwrap(api.get('/main-admin/audit/logs', { params })),
  getTransactionAudit: (params) => unwrap(api.get('/main-admin/audit/transactions', { params })),
  getActivity: (params) => unwrap(api.get('/super-admin/activity', { params })),
  getActivityStats: () => unwrap(api.get('/super-admin/activity/stats')),

  getUsers: (params) => unwrap(api.get('/admin/users', { params })),
  getUser: (id) => unwrap(api.get(`/admin/users/${id}`)),
  updateUserStatus: (id, status) => unwrap(api.put(`/admin/users/${id}/status`, { status })),
  adjustUserBalance: (id, amount, type = 'adjustment') => unwrap(api.post(`/admin/users/${id}/balance`, { amount, type })),
  deleteUser: (id, reason = '') => unwrap(api.delete(`/admin/users/${id}`, { data: { reason } })),

  getTransactions: (params) => unwrap(api.get('/admin/transactions', { params })),
  getPendingTransactions: (type) => unwrap(api.get('/super-admin/transactions/pending', { params: type ? { type } : undefined })),
  settleTransaction: (id, status) => unwrap(api.put(`/super-admin/transactions/${id}/settle`, { status })),
  approveTransaction: (id) => unwrap(api.put(`/super-admin/transactions/${id}/settle`, { status: 'completed' })),
  rejectTransaction: (id) => unwrap(api.put(`/super-admin/transactions/${id}/settle`, { status: 'rejected' })),

  getGames: (params) => unwrap(api.get('/games/available', { params })),
  getGame: (id) => unwrap(api.get(`/admin/games/${id}`)),
  createGame: (payload) => unwrap(api.post('/admin/games', payload)),
  updateGame: (id, payload) => unwrap(api.put(`/admin/games/${id}`, payload)),
  deleteGame: (id) => unwrap(api.delete(`/admin/games/${id}`)),
  getGameCapabilities: (id) => unwrap(api.get(`/games/capabilities/${id}`)),

  getPromotions: (params) => unwrap(api.get('/admin/promotions', { params })),
  addPromotion: (payload) => unwrap(api.post('/admin/promotions', payload)),
  updatePromotion: (id, payload) => unwrap(api.put(`/admin/promotions/${id}`, payload)),
  deletePromotion: (id) => unwrap(api.delete(`/admin/promotions/${id}`)),

  getBanners: () => unwrap(api.get('/admin/banners')),
  createBanner: (payload) => unwrap(api.post('/admin/banners', payload)),
  updateBanner: (id, payload) => unwrap(api.put(`/admin/banners/${id}`, payload)),
  deleteBanner: (id) => unwrap(api.delete(`/admin/banners/${id}`)),

  getLanguages: () => unwrap(api.get('/admin/languages')),
  updateLanguage: (code, translations) => unwrap(api.put(`/admin/languages/${encodeURIComponent(code)}`, { translations })),
  getSettings: (category) => unwrap(api.get(`/admin/settings/${encodeURIComponent(category)}`)),
  updateSettings: (category, settings) => unwrap(api.put(`/admin/settings/${encodeURIComponent(category)}`, settings)),
  getOwnerSettings: () => unwrap(api.get('/super-admin/settings')),
  updateOwnerSettings: (payload) => unwrap(api.put('/super-admin/settings', payload)),
  updateGameSettings: (payload) => unwrap(api.put('/super-admin/games/settings', payload)),

  getPaymentProviders: () => unwrap(api.get('/super-admin/payment-providers')),
  createPaymentProvider: (payload) => unwrap(api.post('/super-admin/payment-providers', payload)),
  updatePaymentProvider: (id, payload) => unwrap(api.put(`/super-admin/payment-providers/${id}`, payload)),
  deletePaymentProvider: (id) => unwrap(api.delete(`/super-admin/payment-providers/${id}`)),
  updatePaymentSettings: (payload) => unwrap(api.put('/super-admin/payments/settings', payload)),
  getPublicPaymentProviders: () => unwrap(api.get('/payment-providers')),

  getSupportMessages: (params) => unwrap(api.get('/admin/support/messages', { params })),
  sendSupportReply: (userId, message) => unwrap(api.post('/admin/support/reply', { userId, message })),
  resolveSupportTicket: (id) => unwrap(api.put(`/admin/support/resolve/${id}`)),

  getIntegrationStatus: () => unwrap(api.get('/integration/status')),
  health: () => unwrap(api.get('/health')),
};

export default superAdminApi;
