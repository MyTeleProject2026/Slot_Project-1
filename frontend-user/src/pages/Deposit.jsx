import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaArrowLeft, FaCreditCard, FaQrcode } from 'react-icons/fa';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Deposit = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requestDeposit, bankAccounts } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);

  const methods = [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: FaCreditCard },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaQrcode },
    { id: 'e_wallet', name: 'E-Wallet', icon: FaWallet },
  ];
  const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (amt < 100) { toast.error('Minimum deposit is 100 THB'); return; }
    setLoading(true);
    try {
      await requestDeposit(amt, selectedMethod, selectedBank);
      navigate('/wallet');
    } catch (err) { /* handled in context */ } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"><FaArrowLeft /> Back</button>
      <h1 className="text-2xl font-bold text-white mb-6">Deposit</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Amount (THB)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition" min="100" step="1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(val => (
            <button key={val} type="button" onClick={() => setAmount(val.toString())} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${parseFloat(amount) === val ? 'bg-primary-500 text-dark-900' : 'bg-dark-800 text-gray-300 hover:bg-dark-700'}`}>{val}</button>
          ))}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {methods.map(m => {
              const Icon = m.icon;
              return (
                <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)} className={`p-3 rounded-xl flex flex-col items-center gap-1 transition border ${selectedMethod === m.id ? 'bg-primary-500/20 border-primary-500 text-primary-500' : 'bg-dark-800 border-dark-700 text-gray-400 hover:text-white'}`}>
                  <Icon className="text-xl" /><span className="text-xs font-medium">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        {selectedMethod === 'bank_transfer' && bankAccounts.length > 0 && (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Select Bank Account</label>
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition">
              <option value="">Select account</option>
              {bankAccounts.map(bank => <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.account_number}</option>)}
            </select>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-500 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</> : <><FaWallet /> Submit Deposit</>}
        </button>
        <div className="text-center text-xs text-gray-500"><p>⚠️ Deposits processed within 24 hours</p><p className="mt-1">Minimum deposit: 100 THB</p></div>
      </form>
    </div>
  );
};

export default Deposit;