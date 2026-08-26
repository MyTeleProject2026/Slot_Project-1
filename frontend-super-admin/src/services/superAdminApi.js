import api from './api';

const superAdminApi = {
  getDashboard: () => api.get('/super-admin/dashboard'),
  getBalance: () => api.get('/super-admin/balance'),
  addBalance: (payload) => api.post('/super-admin/balance/add', payload),
  transferBalance: (payload) => api.post('/super-admin/balance/transfer', payload),
  getSettings: () => api.get('/super-admin/settings'),
  updateSettings: (payload) => api.put('/super-admin/settings', payload),
  getGameSettings: () => api.get('/super-admin/game-settings'),
  updateGameSettings: (payload) => api.put('/super-admin/game-settings', payload),
  getPaymentSettings: () => api.get('/super-admin/payment-settings'),
  updatePaymentSettings: (payload) => api.put('/super-admin/payment-settings', payload),
};

export default superAdminApi;
