import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWallet, FaArrowDown, FaArrowUp, FaHistory, FaPlus, FaMinus, FaCopy, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Wallet = () => {
  const { balance, transactions, loading, bankAccounts } = useWallet();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('balance');
  const [copied, setCopied] = useState(false);

  const copyAddress = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-dark-700/50 text-center">
          <FaWallet className="text-5xl md:text-6xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wallet</h2>
          <p className="text-gray-400 mb-6">Please login to view your wallet</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all inline-block">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  const totalBalance = (balance?.main || 0) + (balance?.bonus || 0) + (balance?.commission || 0);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-4 md:mb-6">My Wallet</h1>

        {/* Total Balance */}
        <div className="bg-gradient-to-r from-primary-500/10 to-orange-500/10 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border border-primary-500/20 backdrop-blur-sm">
          <p className="text-gray-400 text-sm">Total Balance</p>
          <p className="text-2xl md:text-3xl font-bold text-white">
            {totalBalance.toFixed(2)} <span className="text-sm text-gray-400">THB</span>
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <motion.div 
            className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-dark-700/30"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-gray-400 text-xs md:text-sm">Main</p>
            <p className="text-lg md:text-xl font-bold text-white">{balance?.main?.toFixed(2) || '0.00'}</p>
          </motion.div>
          <motion.div 
            className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-dark-700/30"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-gray-400 text-xs md:text-sm">Bonus</p>
            <p className="text-lg md:text-xl font-bold text-primary-500">{balance?.bonus?.toFixed(2) || '0.00'}</p>
          </motion.div>
          <motion.div 
            className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-dark-700/30"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-gray-400 text-xs md:text-sm">Commission</p>
            <p className="text-lg md:text-xl font-bold text-green-500">{balance?.commission?.toFixed(2) || '0.00'}</p>
          </motion.div>
          <motion.div 
            className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-dark-700/30"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-gray-400 text-xs md:text-sm">Locked</p>
            <p className="text-lg md:text-xl font-bold text-yellow-500">{balance?.locked?.toFixed(2) || '0.00'}</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4 md:mb-6">
          <Link to="/wallet/deposit" className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all hover:scale-105">
            <FaPlus /> Deposit
          </Link>
          <Link to="/wallet/withdraw" className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all hover:scale-105">
            <FaMinus /> Withdraw
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['balance', 'deposits', 'withdrawals', 'bonus', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25' 
                  : 'bg-dark-800/80 backdrop-blur-sm text-gray-400 hover:text-white border border-dark-700/30'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-700/30">
          {loading ? (
            <div className="p-8 text-center"><LoadingSpinner /></div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FaHistory className="text-4xl mx-auto mb-3 opacity-30" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-700/50 max-h-[400px] overflow-y-auto">
              {transactions.slice(0, 20).map((tx) => (
                <motion.div 
                  key={tx.id} 
                  className="p-3 md:p-4 flex items-center justify-between hover:bg-dark-700/30 transition"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' :
                      tx.type === 'withdraw' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {tx.type === 'deposit' ? <FaArrowDown /> :
                       tx.type === 'withdraw' ? <FaArrowUp /> :
                       <FaHistory />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : tx.type === 'withdraw' ? 'text-red-500' : 'text-blue-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className={`text-xs ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tx.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bank Accounts */}
        <div className="mt-6">
          <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
            <span>Bank Accounts</span>
            <Link to="/wallet/banks" className="text-sm text-primary-500 hover:text-primary-400 transition">
              + Manage
            </Link>
          </h3>
          {bankAccounts.length === 0 ? (
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-4 text-center border border-dark-700/30">
              <p className="text-gray-400 text-sm">No bank accounts added</p>
              <Link to="/wallet/banks" className="mt-2 inline-block text-primary-500 text-sm hover:text-primary-400">
                + Add Bank Account
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="bg-dark-800/80 backdrop-blur-sm p-3 rounded-xl flex items-center justify-between border border-dark-700/30">
                  <div>
                    <p className="font-medium text-sm text-white">{bank.bank_name}</p>
                    <p className="text-xs text-gray-400">{bank.account_name} - {bank.account_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {bank.is_default && (
                      <span className="text-xs bg-primary-500/20 text-primary-500 px-2 py-0.5 rounded-full">Default</span>
                    )}
                    <button 
                      onClick={() => copyAddress(bank.account_number)}
                      className="p-1.5 rounded-lg hover:bg-dark-700/50 transition"
                    >
                      {copied ? <FaCheck className="text-green-500" /> : <FaCopy className="text-gray-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Wallet;
