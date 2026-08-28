import api from './api';

const normalize = (data) => Array.isArray(data) ? data : (data?.transactions || []);

export async function getPendingTransactions(type) {
  const response = await api.get('/super-admin/transactions/pending', {
    params: type ? { type } : undefined
  });
  return normalize(response.data);
}

export async function settleTransaction(id, status) {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) throw new Error('Invalid transaction id');
  if (!['completed', 'rejected'].includes(status)) throw new Error('Invalid settlement status');
  const response = await api.put(`/super-admin/transactions/${id}/settle`, { status });
  return response.data?.transaction;
}

export const getPendingDeposits = () => getPendingTransactions('deposit');
export const getPendingWithdrawals = () => getPendingTransactions('withdraw');
export const approveTransaction = (id) => settleTransaction(id, 'completed');
export const rejectTransaction = (id) => settleTransaction(id, 'rejected');
