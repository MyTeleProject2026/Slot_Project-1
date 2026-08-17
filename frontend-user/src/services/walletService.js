import api from './api';

export const walletService = {
  getBalance: () => api.get('/wallet/balance').then(res => res.data),
  
  getTransactions: (params = {}) => {
    // ✅ FIX: Ensure params is always an object
    const safeParams = params && typeof params === 'object' ? params : {};
    return api.get('/wallet/transactions', { params: safeParams }).then(res => res.data);
  },
  
  requestDeposit: (data) => {
    // ✅ FIX: Ensure data is an object
    const safeData = data && typeof data === 'object' ? data : {};
    return api.post('/wallet/deposit', safeData).then(res => res.data);
  },
  
  requestWithdraw: (data) => {
    const safeData = data && typeof data === 'object' ? data : {};
    return api.post('/wallet/withdraw', safeData).then(res => res.data);
  },
  
  getBankAccounts: () => api.get('/wallet/banks').then(res => res.data),
  addBankAccount: (data) => api.post('/wallet/banks', data).then(res => res.data),
  updateBankAccount: (id, data) => api.put(`/wallet/banks/${id}`, data).then(res => res.data),
  deleteBankAccount: (id) => api.delete(`/wallet/banks/${id}`).then(res => res.data),
};

export default walletService;
