import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const WithdrawApproval = () => {
  const { getTransactions, approveTransaction, rejectTransaction } = useAdmin();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await getTransactions({ type: 'withdraw', status: 'pending' });
      setWithdrawals(data.transactions || []);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this withdrawal?')) {
      try {
        await approveTransaction(id);
        loadWithdrawals();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this withdrawal?')) {
      try {
        await rejectTransaction(id);
        loadWithdrawals();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'User' },
    { key: 'amount', label: 'Amount', render: (value) => `฿${value?.toFixed(2)}` },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Date', render: (value) => new Date(value).toLocaleString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleApprove(row.id)}
            className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
            title="Approve"
          >
            <FaCheck className="text-xs" />
          </button>
          <button
            onClick={() => handleReject(row.id)}
            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            title="Reject"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Withdraw Approval</h1>
        <p className="text-gray-400 mb-6">Approve or reject pending withdrawals</p>

        {withdrawals.length === 0 ? (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-dark-700/50">
            <p className="text-gray-400">No pending withdrawals</p>
          </div>
        ) : (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <DataTable columns={columns} data={withdrawals} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WithdrawApproval;
