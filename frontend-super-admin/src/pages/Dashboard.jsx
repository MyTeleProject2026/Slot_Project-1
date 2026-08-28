import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaGamepad, FaMoneyBillWave, FaExchangeAlt, FaWallet } from 'react-icons/fa';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatMMK } from '../config/platform';
import superAdminApi from '../services/superAdminApi';

const Dashboard = () => {
  const { getDashboardStats } = useAdmin();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [masterBalance, setMasterBalance] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getDashboardStats(),
        superAdminApi.getMasterBalance(),
        superAdminApi.getActivity({ limit: 5 }),
      ]);

      if (!mounted) return;

      const [statsResult, balanceResult, activityResult] = results;
      const nextErrors = [];

      if (statsResult.status === 'fulfilled') {
        const value = statsResult.value;
        setStats(value?.stats || value || {});
      } else {
        console.error('Failed to load dashboard stats:', statsResult.reason);
        nextErrors.push('Dashboard statistics could not be loaded.');
      }

      if (balanceResult.status === 'fulfilled') {
        const value = balanceResult.value;
        setMasterBalance(value?.data || value || {});
      } else {
        console.error('Failed to load master balance:', balanceResult.reason);
        nextErrors.push(balanceResult.reason?.response?.data?.error || 'Master balance could not be loaded.');
      }

      if (activityResult.status === 'fulfilled') {
        const value = activityResult.value;
        setActivities(Array.isArray(value?.activities) ? value.activities : []);
      } else {
        console.error('Failed to load activity:', activityResult.reason);
        nextErrors.push('Recent administrative activity could not be loaded.');
      }

      setErrors(nextErrors);
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner />;

  const deposits = Number(stats?.transactions?.totalDeposits || 0);
  const withdrawals = Number(stats?.transactions?.totalWithdrawals || 0);
  const balance = Number(masterBalance?.balance || masterBalance?.available || 0);

  const activityText = (activity) => {
    if (activity.description) return activity.description;
    return `${activity.action || 'Administrative action'}${activity.target_type ? ` • ${activity.target_type}` : ''}`;
  };

  const activityTime = (activity) => {
    if (!activity.created_at) return '';
    const date = new Date(activity.created_at);
    return Number.isNaN(date.getTime()) ? String(activity.created_at) : date.toLocaleString();
  };

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">N999Bet Super Admin</h1>
          <p className="text-gray-400">Welcome back, {user?.username || user?.email || 'Administrator'}.</p>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            {errors.map((error, index) => <div key={index}>{error}</div>)}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatsCard title="Total Users" value={stats?.users?.total_users || 0} icon={FaUsers} color="primary" />
          <StatsCard title="Total Games" value={stats?.games?.total_games || 0} icon={FaGamepad} color="blue" />
          <StatsCard title="Master Balance (MMK)" value={formatMMK(balance)} icon={FaWallet} color="primary" />
          <StatsCard title="Total Deposits (MMK)" value={formatMMK(deposits)} icon={FaMoneyBillWave} color="green" />
          <StatsCard title="Total Withdrawals (MMK)" value={formatMMK(withdrawals)} icon={FaExchangeAlt} color="red" />
        </div>

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Administrative Activity</h2>
            <span className="text-xs text-gray-500">Live backend audit log</span>
          </div>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-4 p-3 bg-dark-700/30 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{activityText(activity)}</p>
                    <p className="text-xs text-gray-400">
                      {activity.admin_name || `Admin #${activity.admin_id || '—'}`} {activityTime(activity) ? `• ${activityTime(activity)}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{activity.action || 'action'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No recent administrative activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
