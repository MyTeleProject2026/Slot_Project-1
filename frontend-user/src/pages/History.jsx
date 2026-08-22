import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import LoadingSpinner from '../components/common/LoadingSpinner';

const History = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { transactions, loading, fetchTransactions } = useWallet();
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-dark-700/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{t('history.title')}</h2>
          <p className="text-gray-400 mb-6">{t('profile.loginRequired')}</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all inline-block">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-4 md:mb-6">{t('history.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['transactions', 'bets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25' 
                  : 'bg-dark-800/80 backdrop-blur-sm text-gray-400 hover:text-white border border-dark-700/30'
              }`}
            >
              {tab === 'transactions' ? t('history.transactions') : t('history.bets')}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-700/30">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>{t('history.noData')}</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-700/50 max-h-[500px] overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-dark-700/30 transition">
                  <div>
                    <p className="font-medium text-sm text-white">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-500' : tx.type === 'withdraw' ? 'text-red-500' : 'text-blue-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className={`text-xs ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tx.status}
                    </p>
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

export default History;
