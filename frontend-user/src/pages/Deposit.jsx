import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaArrowLeft, FaCreditCard, FaQrcode, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useCountry } from '../contexts/CountryContext';

const Deposit = () => {
  const { currency } = useCountry();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requestDeposit, bankAccounts } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const methods = [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: FaCreditCard },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaQrcode },
    { id: 'e_wallet', name: 'E-Wallet', icon: FaWallet },
  ];
  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt < 1000) { toast.error(`Minimum deposit is 1000 ${currency}`); return; }
    setConfirmModal(true);
  };

  const confirmDeposit = async () => {
    setConfirmModal(false);
    setLoading(true);
    try { await requestDeposit(parseFloat(amount), selectedMethod, selectedBank); navigate('/wallet'); }
    catch (err) { /* handled in context */ }
    finally { setLoading(false); }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-all hover:translate-x-[-4px]">
        <FaArrowLeft /> Back
      </button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-white mb-6">Deposit Funds</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Amount ({currency})</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full px-4 py-3 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" min="1000" step="1" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(val => <button key={val} type="button" onClick={() => setAmount(val.toString())} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${parseFloat(amount) === val ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25' : 'bg-dark-800/80 backdrop-blur-sm text-gray-300 hover:bg-dark-700/80 border border-dark-700/30'}`}>{val.toLocaleString()}</button>)}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(m => { const Icon = m.icon; return <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${selectedMethod === m.id ? 'bg-primary-500/20 border-primary-500 text-primary-500 shadow-lg shadow-primary-500/25' : 'bg-dark-800/80 backdrop-blur-sm border-dark-700/30 text-gray-400 hover:text-white hover:bg-dark-700/80'}`}><Icon className="text-xl" /><span className="text-xs font-medium">{m.name}</span></button>; })}
            </div>
          </div>
          {selectedMethod === 'bank_transfer' && bankAccounts.length > 0 && <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Select Bank Account</label>
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full px-4 py-3 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all">
              <option value="">Select account</option>{bankAccounts.map(bank => <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.account_number}</option>)}
            </select>
          </div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</> : <><FaWallet /> Submit Deposit</>}
          </button>
          <div className="text-center text-xs text-gray-500 space-y-1"><p>⚠️ Deposits processed within 24 hours</p><p>Minimum deposit: 1000 {currency}</p></div>
        </form>
      </motion.div>
      {confirmModal && <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"><motion.div className="bg-dark-900 rounded-2xl p-6 max-w-sm w-full border border-dark-700/50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h3 className="text-xl font-bold text-white mb-4">Confirm Deposit</h3>
        <p className="text-gray-400 mb-2">Amount: <span className="text-white font-bold">{parseFloat(amount).toFixed(2)} {currency}</span></p>
        <p className="text-gray-400 mb-6">Method: <span className="text-white">{methods.find(m => m.id === selectedMethod)?.name}</span></p>
        <div className="flex gap-3"><button onClick={() => setConfirmModal(false)} className="flex-1 py-2.5 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition flex items-center justify-center gap-2"><FaTimes /> Cancel</button><button onClick={confirmDeposit} className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition flex items-center justify-center gap-2"><FaCheck /> Confirm</button></div>
      </motion.div></div>}
    </div>
  );
};
export default Deposit;
