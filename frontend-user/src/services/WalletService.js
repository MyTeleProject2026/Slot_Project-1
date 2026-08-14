import api from './api';

export const walletService = {
  getBalance: () => api.get('/wallet/balance').then(res => res.data),
  getTransactions: (params = {}) => api.get('/wallet/transactions', { params }).then(res => res.data),
  requestDeposit: (data) => api.post('/wallet/deposit', data).then(res => res.data),
  requestWithdraw: (data) => api.post('/wallet/withdraw', data).then(res => res.data),
  getBankAccounts: () => api.get('/wallet/banks').then(res => res.data),
  addBankAccount: (data) => api.post('/wallet/banks', data).then(res => res.data),
  updateBankAccount: (id, data) => api.put(`/wallet/banks/${id}`, data).then(res => res.data),
  deleteBankAccount: (id) => api.delete(`/wallet/banks/${id}`).then(res => res.data),
};

export default walletService;