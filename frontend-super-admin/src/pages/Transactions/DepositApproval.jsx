import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DepositApproval = () => {
  const { getTransactions, approveTransaction, rejectTransaction } = useAdmin();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await getTransactions({ type: 'deposit', status: 'pending' });
      setDeposits(data.transactions || []);
    } catch (error) {
      console.error('Failed to load deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this deposit?')) {
      try {
        await approveTransaction(id);
        loadDeposits();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this deposit?')) {
      try {
        await rejectTransaction(id);
        loadDeposits();
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
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Deposit Approval</h1>
        <p className="text-gray-400 mb-6">Approve or reject pending deposits</p>

        {deposits.length === 0 ? (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-dark-700/50">
            <p className="text-gray-400">No pending deposits</p>
          </div>
        ) : (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
            <DataTable columns={columns} data={deposits} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DepositApproval;
