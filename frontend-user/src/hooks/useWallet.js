import { useContext } from 'react';
import WalletContext from '../contexts/WalletContext';

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    const fetchBalance = async () => {};
    return {
      balance: { main: 0, bonus: 0, commission: 0, locked: 0, total: 0 },
      transactions: [],
      loading: false,
      bankAccounts: [],
      fetchBalance,
      refreshBalance: fetchBalance,
      fetchTransactions: async () => {},
      fetchBankAccounts: async () => {},
      requestDeposit: async () => {},
      requestWithdraw: async () => {},
      addBankAccount: async () => {},
      updateBankAccount: async () => {},
      deleteBankAccount: async () => {},
    };
  }
  return {
    ...context,
    refreshBalance: context.refreshBalance || context.fetchBalance || (async () => {}),
  };
};

export default useWallet;
