import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};

export const WalletProvider = ({ children }) => {
  const { isAuthenticated, api } = useAuth();
  const [balance, setBalance] = useState({ main: 0, bonus: 0, commission: 0, locked: 0, total: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);

  const fetchBalance = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await walletService.getBalance(api);
      setBalance(data.balance);
    } catch (error) {
      console.error('Fetch balance error:', error);
    }
  };

  const fetchTransactions = async (params = {}) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await walletService.getTransactions(api, params);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await walletService.getBankAccounts(api);
      setBankAccounts(data.bankAccounts || []);
    } catch (error) {
      console.error('Fetch bank accounts error:', error);
    }
  };

  const requestDeposit = async (amount, paymentMethod, bankAccountId) => {
    try {
      const data = await walletService.requestDeposit(api, { amount, paymentMethod, bankAccountId });
      toast.success('Deposit request submitted');
      await fetchBalance();
      await fetchTransactions();
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Deposit request failed');
      throw error;
    }
  };

  const requestWithdraw = async (amount, bankAccountId) => {
    try {
      const data = await walletService.requestWithdraw(api, { amount, bankAccountId });
      toast.success('Withdraw request submitted');
      await fetchBalance();
      await fetchTransactions();
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Withdraw request failed');
      throw error;
    }
  };

  const addBankAccount = async (accountData) => {
    try {
      const data = await walletService.addBankAccount(api, accountData);
      toast.success('Bank account added');
      await fetchBankAccounts();
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add bank account');
      throw error;
    }
  };

  const updateBankAccount = async (id, accountData) => {
    try {
      const data = await walletService.updateBankAccount(api, id, accountData);
      toast.success('Bank account updated');
      await fetchBankAccounts();
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update bank account');
      throw error;
    }
  };

  const deleteBankAccount = async (id) => {
    try {
      await walletService.deleteBankAccount(api, id);
      toast.success('Bank account deleted');
      await fetchBankAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete bank account');
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchTransactions();
      fetchBankAccounts();
    }
  }, [isAuthenticated]);

  const value = {
    balance,
    transactions,
    loading,
    bankAccounts,
    fetchBalance,
    fetchTransactions,
    fetchBankAccounts,
    requestDeposit,
    requestWithdraw,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export default WalletContext;