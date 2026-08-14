import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWallet, FaArrowDown, FaArrowUp, FaHistory, FaPlus, FaMinus } from 'react-icons/fa';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';

const Wallet = () => {
  const { balance, transactions, loading, bankAccounts } = useWallet();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('balance');

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaWallet className="text-6xl text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Wallet</h2>
        <p className="text-gray-400 mb-6">Please login to view your wallet</p>
        <Link to="/login" className="px-6 py-3 bg-primary-500 text-dark-900 rounded-lg font-semibold hover:bg-primary-400 transition">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Wallet</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-dark-800 rounded-xl p-4"><p className="text-gray-400 text-sm">Main Balance</p><p className="text-2xl font-bold text-white">{balance?.main?.toFixed(2) || '0.00'}</p></div>
        <div className="bg-dark-800 rounded-xl p-4"><p className="text-gray-400 text-sm">Bonus</p><p className="text-2xl font-bold text-primary-500">{balance?.bonus?.toFixed(2) || '0.00'}</p></div>
        <div className="bg-dark-800 rounded-xl p-4"><p className="text-gray-400 text-sm">Commission</p><p className="text-2xl font-bold text-green-500">{balance?.commission?.toFixed(2) || '0.00'}</p></div>
        <div className="bg-dark-800 rounded-xl p-4"><p className="text-gray-400 text-sm">Total</p><p className="text-2xl font-bold text-yellow-500">{balance?.total?.toFixed(2) || '0.00'}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/wallet/deposit" className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-500 transition"><FaPlus /> Deposit</Link>
        <Link to="/wallet/withdraw" className="flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition"><FaMinus /> Withdraw</Link>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['balance', 'deposits', 'withdrawals', 'bonus', 'all'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab ? 'bg-primary-500 text-dark-900' : 'bg-dark-800 text-gray-400 hover:text-white'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-dark-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full mx-auto"></div></div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400"><FaHistory className="text-4xl mx-auto mb-3 opacity-30" /><p>No transactions yet</p></div>
        ) : (
          <div className="divide-y divide-dark-700">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' : tx.type === 'withdraw' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {tx.type === 'deposit' ? <FaArrowDown /> : tx.type === 'withdraw' ? <FaArrowUp /> : <FaHistory />}
                  </div>
                  <div><p className="font-medium text-sm">{tx.description || tx.type}</p><p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p></div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>{tx.type === 'deposit' ? '+' : '-'}{tx.amount}</p>
                  <p className={`text-xs ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6">
        <h3 className="text-white font-semibold mb-3">Bank Accounts</h3>
        {bankAccounts.length === 0 ? (
          <p className="text-gray-400 text-sm">No bank accounts added</p>
        ) : (
          <div className="space-y-2">
            {bankAccounts.map(bank => (
              <div key={bank.id} className="bg-dark-800 p-3 rounded-lg flex items-center justify-between">
                <div><p className="font-medium text-sm">{bank.bank_name}</p><p className="text-xs text-gray-400">{bank.account_name} - {bank.account_number}</p></div>
                {bank.is_default && <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-0.5 rounded-full">Default</span>}
              </div>
            ))}
          </div>
        )}
        <Link to="/wallet/banks" className="mt-3 inline-block text-sm text-primary-500 hover:text-primary-400">+ Manage Bank Accounts</Link>
      </div>
    </div>
  );
};

export default Wallet;