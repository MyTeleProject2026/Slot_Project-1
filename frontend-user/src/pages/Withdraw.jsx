import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaWallet, FaUniversity, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useCountry } from '../contexts/CountryContext';

const Withdraw = () => {
  const { currency } = useCountry();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requestWithdraw, bankAccounts, balance } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const quickAmounts = [5000, 10000, 25000, 50000, 100000, 200000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) { toast.error('Please enter a valid amount'); return; }
    if (withdrawAmount < 5000) { toast.error(`Minimum withdrawal amount is 5000 ${currency}`); return; }
    if (withdrawAmount > (balance?.main || 0)) { toast.error('Insufficient balance'); return; }
    if (!selectedBank) { toast.error('Please select a bank account'); return; }
    setConfirmModal(true);
  };

  const confirmWithdraw = async () => {
    setConfirmModal(false); setLoading(true);
    try { await requestWithdraw(parseFloat(amount), selectedBank); navigate('/wallet'); }
    catch (error) { /* handled by wallet context */ }
    finally { setLoading(false); }
  };

  return <div className="container max-w-md mx-auto px-4 py-6">
    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-all hover:translate-x-[-4px]"><FaArrowLeft /> Back</button>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h1>
      <div className="bg-gradient-to-r from-primary-500/10 to-orange-500/10 rounded-2xl p-4 mb-6 border border-primary-500/20"><p className="text-gray-400 text-sm">Available Balance</p><p className="text-2xl font-bold text-white">{balance?.main?.toFixed(2) || '0.00'} <span className="text-sm text-gray-400">{currency}</span></p></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-gray-300 text-sm font-medium mb-2">Amount ({currency})</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full px-4 py-3 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" min="5000" step="1" /></div>
        <div><label className="block text-gray-300 text-sm font-medium mb-2">Quick Select</label><div className="flex flex-wrap gap-2">{quickAmounts.map(val => <button key={val} type="button" onClick={() => setAmount(val.toString())} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${parseFloat(amount) === val ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25' : 'bg-dark-800/80 backdrop-blur-sm text-gray-300 hover:bg-dark-700/80 border border-dark-700/30'}`}>{val.toLocaleString()}</button>)}</div></div>
        {bankAccounts.length > 0 ? <div><label className="block text-gray-300 text-sm font-medium mb-2">Select Bank Account</label><select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full px-4 py-3 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"><option value="">Select account</option>{bankAccounts.map(bank => <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.account_number}</option>)}</select></div> : <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 text-center border border-dark-700/30"><FaUniversity className="text-4xl text-gray-600 mx-auto mb-2" /><p className="text-gray-400 text-sm">No bank accounts added</p><button type="button" onClick={() => navigate('/wallet/banks')} className="mt-2 text-primary-500 text-sm hover:text-primary-400 transition">+ Add Bank Account</button></div>}
        <button type="submit" disabled={loading || bankAccounts.length === 0} className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">{loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</> : <><FaWallet /> Submit Withdrawal</>}</button>
        <div className="text-center text-xs text-gray-500 space-y-1"><p>⚠️ Withdrawals are processed within 24 hours</p><p>Minimum withdrawal: 5000 {currency}</p><p>💳 Funds will be sent to your selected bank account</p></div>
      </form>
    </motion.div>
    {confirmModal && <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"><motion.div className="bg-dark-900 rounded-2xl p-6 max-w-sm w-full border border-dark-700/50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><h3 className="text-xl font-bold text-white mb-4">Confirm Withdrawal</h3><p className="text-gray-400 mb-2">Amount: <span className="text-white font-bold">{parseFloat(amount).toFixed(2)} {currency}</span></p><p className="text-gray-400 mb-6">To: <span className="text-white">{bankAccounts.find(b => b.id === parseInt(selectedBank))?.bank_name}</span></p><div className="flex gap-3"><button onClick={() => setConfirmModal(false)} className="flex-1 py-2.5 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition flex items-center justify-center gap-2"><FaTimes /> Cancel</button><button onClick={confirmWithdraw} className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition flex items-center justify-center gap-2"><FaCheck /> Confirm</button></div></motion.div></div>}
  </div>;
};
export default Withdraw;
