import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaGamepad, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { getDashboardStats } = useAdmin();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Users"
            value={stats?.users?.total_users || 0}
            icon={FaUsers}
            color="primary"
          />
          <StatsCard
            title="Total Games"
            value={stats?.games?.total_games || 0}
            icon={FaGamepad}
            color="blue"
          />
          <StatsCard
            title="Total Deposits"
            value={stats?.transactions?.totalDeposits || 0}
            icon={FaMoneyBillWave}
            color="green"
            prefix="฿"
          />
          <StatsCard
            title="Total Withdrawals"
            value={stats?.transactions?.totalWithdrawals || 0}
            icon={FaExchangeAlt}
            color="red"
            prefix="฿"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          {stats?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                  <div>
                    <p className="text-sm text-white">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{tx.user_name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className={`text-xs ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
