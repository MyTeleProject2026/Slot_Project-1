import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaWallet, FaHistory } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserDetails, adjustUserBalance } = useAdmin();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('adjustment');

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await getUserDetails(id);
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAdjust = async (e) => {
    e.preventDefault();
    const amount = parseFloat(adjustAmount);
    if (!amount || amount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await adjustUserBalance(id, amount, adjustType);
      loadUser();
      setAdjustAmount('');
    } catch (error) {
      // Error handled in context
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <div className="text-center text-gray-400 py-12">User not found</div>;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <FaArrowLeft /> Back to Users
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-dark-900">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.full_name || user.username}</h2>
                  <p className="text-gray-400">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                    <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <FaEnvelope className="text-primary-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaPhone className="text-primary-500" />
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <FaHistory className="text-primary-500" />
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
              {user.recentTransactions?.length > 0 ? (
                <div className="space-y-2">
                  {user.recentTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-xl">
                      <div>
                        <p className="text-sm text-white">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
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
                <p className="text-gray-400 text-center">No transactions</p>
              )}
            </div>
          </div>

          {/* Balance & Actions */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Balance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Main</span>
                  <span className="text-white font-bold">{user.wallet?.main_balance || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bonus</span>
                  <span className="text-primary-500 font-bold">{user.wallet?.bonus_balance || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Commission</span>
                  <span className="text-green-500 font-bold">{user.wallet?.commission_balance || 0}</span>
                </div>
                <div className="flex justify-between border-t border-dark-700/50 pt-2">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold text-lg">
                    {(user.wallet?.main_balance || 0) + (user.wallet?.bonus_balance || 0) + (user.wallet?.commission_balance || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Adjust Balance */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Adjust Balance</h3>
              <form onSubmit={handleBalanceAdjust} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  >
                    <option value="adjustment">Adjustment</option>
                    <option value="bonus">Bonus</option>
                    <option value="commission">Commission</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition"
                >
                  Apply Adjustment
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetails;
