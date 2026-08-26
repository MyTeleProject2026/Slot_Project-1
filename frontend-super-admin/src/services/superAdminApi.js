import api from './api';

const superAdminApi = {
  getAdmins: () => api.get('/super-admin/admins'),
  createAdmin: (payload) => api.post('/super-admin/admins', payload),
  updateAdmin: (id, payload) => api.put(`/super-admin/admins/${id}`, payload),
  deleteAdmin: (id) => api.delete(`/super-admin/admins/${id}`),
  getBalance: () => api.get('/super-admin/balance'),
  addBalance: (payload) => api.post('/super-admin/balance/add', payload),
  transferBalance: (payload) => api.post('/super-admin/balance/transfer', payload),
  getFundingHistory: () => api.get('/slotopol-funding/history'),
  getSettings: () => api.get('/super-admin/settings'),
  updateSettings: (payload) => api.put('/super-admin/settings', payload),
  updateGameSettings: (payload) => api.put('/super-admin/games/settings', payload),
  updatePaymentSettings: (payload) => api.put('/super-admin/payments/settings', payload),
  getPaymentProviders: () => api.get('/super-admin/payment-providers'),
  createPaymentProvider: (payload) => api.post('/super-admin/payment-providers', payload),
  updatePaymentProvider: (id, payload) => api.put(`/super-admin/payment-providers/${id}`, payload),
  deletePaymentProvider: (id) => api.delete(`/super-admin/payment-providers/${id}`),
};

export default superAdminApi;
