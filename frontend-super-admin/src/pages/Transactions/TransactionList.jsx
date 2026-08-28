import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaSearch, FaTimes, FaSyncAlt } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatMMK } from '../../config/platform';

const TransactionList = () => {
  const { getTransactions, getPendingTransactions, approveTransaction, rejectTransaction, loading: actionLoading } = useAdmin();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadTransactions = async (showSpinner = true) => {
    if (showSpinner) setLoading(true); else setRefreshing(true);
    setError('');
    try {
      const data = filter === 'pending'
        ? await getPendingTransactions()
        : await getTransactions({ status: filter !== 'all' ? filter : undefined });
      setTransactions(Array.isArray(data) ? data : (Array.isArray(data?.transactions) ? data.transactions : []));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadTransactions(); }, [filter]);

  const visibleTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) =>
      [tx.id, tx.user_name, tx.username, tx.type, tx.status, tx.description]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [transactions, search]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this transaction? This will perform the backend operation.')) return;
    try { await approveTransaction(id); await loadTransactions(false); } catch (_) { /* context displays API error */ }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this transaction? This action will settle it as rejected and cannot be undone.')) return;
    try { await rejectTransaction(id); await loadTransactions(false); } catch (_) { /* context displays API error */ }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'Player', render: (value, row) => value || row.username || row.user_id || '—' },
    { key: 'type', label: 'Type', render: (value) => <span className="capitalize">{value || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (value) => formatMMK(Number(value) || 0) },
    { key: 'status', label: 'Status', render: (value) => <span className={`px-2 py-1 rounded-full text-xs ${value === 'completed' ? 'bg-green-500/20 text-green-400' : value === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : value === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>{value || 'unknown'}</span> },
    { key: 'created_at', label: 'Date', render: (value) => value ? new Date(value).toLocaleString() : 'N/A' },
    { key: 'actions', label: 'Actions', render: (_, row) => row.status !== 'pending' ? <span className="text-gray-500">—</span> : <div className="flex items-center gap-2"><button disabled={actionLoading} onClick={() => handleApprove(row.id)} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50" title="Approve"><FaCheck /></button><button disabled={actionLoading} onClick={() => handleReject(row.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50" title="Reject"><FaTimes /></button></div> }
  ];

  if (loading) return <LoadingSpinner />;

  return <div className="w-full"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div><h1 className="text-2xl md:text-3xl font-bold gradient-text">Master Transactions</h1><p className="text-gray-400">Review and settle N999Bet transactions through the backend.</p></div>
      <button onClick={() => loadTransactions(false)} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white hover:border-primary-500 disabled:opacity-50"><FaSyncAlt className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
    </div>
    {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex-1"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player, ID, type or status..." className="w-full bg-dark-800/80 text-white rounded-xl px-4 py-3 pl-10 border border-dark-700/50 focus:border-primary-500 focus:outline-none" /><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /></div>
      <div className="flex gap-2 overflow-x-auto">{['all', 'pending', 'completed', 'rejected', 'cancelled'].map((status) => <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${filter === status ? 'bg-primary-500 text-dark-900' : 'bg-dark-800 text-gray-400 border border-dark-700'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>)}</div>
    </div>
    <div className="mb-3 text-sm text-gray-400">Showing {visibleTransactions.length} transaction{visibleTransactions.length === 1 ? '' : 's'}</div>
    <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/50 overflow-hidden"><DataTable columns={columns} data={visibleTransactions} loading={refreshing} /></div>
  </motion.div></div>;
};

export default TransactionList;
