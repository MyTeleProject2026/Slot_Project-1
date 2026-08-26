import api from './api';

const superAdminApi = {
  // N999Bet Super Admin API (server is mounted at /api/super-admin)
  getAdmins: () => api.get('/super-admin/admins'),
  createAdmin: (payload) => api.post('/super-admin/admins', payload),
  updateAdmin: (id, payload) => api.put(`/super-admin/admins/${id}`, payload),
  deleteAdmin: (id) => api.delete(`/super-admin/admins/${id}`),

  getBalance: () => api.get('/super-admin/balance'),
  addBalance: (payload) => api.post('/super-admin/balance/add', payload),
  transferBalance: (payload) => api.post('/super-admin/balance/transfer', payload),

  getSettings: () => api.get('/super-admin/settings'),
  updateSettings: (payload) => api.put('/super-admin/settings', payload),
  updateGameSettings: (payload) => api.put('/super-admin/games/settings', payload),
  updatePaymentSettings: (payload) => api.put('/super-admin/payments/settings', payload),
};

export default superAdminApi;
