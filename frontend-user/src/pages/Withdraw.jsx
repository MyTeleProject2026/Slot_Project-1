import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaWallet, FaUniversity } from 'react-icons/fa'; // ✅ Fixed import
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Withdraw = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requestWithdraw, bankAccounts, balance } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount < 500) {
      toast.error('Minimum withdrawal amount is 500 THB');
      return;
    }
    if (withdrawAmount > (balance?.main || 0)) {
      toast.error('Insufficient balance');
      return;
    }
    if (!selectedBank) {
      toast.error('Please select a bank account');
      return;
    }
    setLoading(true);
    try {
      await requestWithdraw(withdrawAmount, selectedBank);
      navigate('/wallet');
    } catch (error) {
      // Error already handled by wallet context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition">
        <FaArrowLeft /> Back
      </button>
      <h1 className="text-2xl font-bold text-white mb-6">Withdraw</h1>
      <div className="bg-dark-800 rounded-xl p-4 mb-6">
        <p className="text-gray-400 text-sm">Available Balance</p>
        <p className="text-2xl font-bold text-white">{balance?.main?.toFixed(2) || '0.00'} THB</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Amount (THB)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            min="500"
            step="1"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                parseFloat(amount) === val
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
        {bankAccounts.length > 0 ? (
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Select Bank Account</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            >
              <option value="">Select account</option>
              {bankAccounts.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bank_name} - {bank.account_number}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-dark-800 rounded-xl p-4 text-center">
            <FaUniversity className="text-4xl text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No bank accounts added</p>
            <button
              type="button"
              onClick={() => navigate('/wallet/banks')}
              className="mt-2 text-primary-500 text-sm hover:text-primary-400"
            >
              + Add Bank Account
            </button>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || bankAccounts.length === 0}
          className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Processing...
            </>
          ) : (
            <>
              <FaWallet /> Submit Withdrawal
            </>
          )}
        </button>
        <div className="text-center text-xs text-gray-500">
          <p>⚠️ Withdrawals are processed within 24 hours</p>
          <p className="mt-1">Minimum withdrawal: 500 THB</p>
        </div>
      </form>
    </div>
  );
};

export default Withdraw;
