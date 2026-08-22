import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TransactionList = () => {
  const { getTransactions, approveTransaction, rejectTransaction } = useAdmin();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions({ status: filter !== 'all' ? filter : undefined });
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this transaction?')) {
      try {
        await approveTransaction(id);
        loadTransactions();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this transaction?')) {
      try {
        await rejectTransaction(id);
        loadTransactions();
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'User' },
    { key: 'type', label: 'Type' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : `฿${num.toFixed(2)}`;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'completed' ? 'bg-green-500/20 text-green-400' :
          value === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
          value === 'rejected' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        if (row.status !== 'pending') return <span className="text-gray-500">-</span>;
        return (
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
        );
      },
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Transactions</h1>
            <p className="text-gray-400">Manage all transactions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'completed', 'rejected', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25'
                  : 'bg-dark-800/80 backdrop-blur-sm text-gray-400 hover:text-white border border-dark-700/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-4">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-dark-800/80 text-white rounded-xl px-4 py-2 pl-10 border border-dark-700/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Table */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden">
          <DataTable
            columns={columns}
            data={transactions}
            loading={loading}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionList;
