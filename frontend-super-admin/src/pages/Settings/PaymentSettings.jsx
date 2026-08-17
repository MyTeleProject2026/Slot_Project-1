import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const PaymentSettings = () => {
  const { getSettings, updateSettings } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_methods: ['bank_transfer', 'crypto', 'e_wallet'],
    auto_approve_deposit: false,
    auto_approve_withdraw: false,
    deposit_fee: 0,
    withdraw_fee: 0,
  });
  const [newMethod, setNewMethod] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings('payment');
      if (data.settings) {
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          payment_methods: data.settings.payment_methods || ['bank_transfer', 'crypto', 'e_wallet'],
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addPaymentMethod = () => {
    if (newMethod.trim() && !settings.payment_methods.includes(newMethod.trim())) {
      setSettings(prev => ({
        ...prev,
        payment_methods: [...prev.payment_methods, newMethod.trim()],
      }));
      setNewMethod('');
    }
  };

  const removePaymentMethod = (method) => {
    setSettings(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.filter(m => m !== method),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('payment', settings);
      toast.success('Payment settings saved successfully!');
    } catch (error) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-6">Payment Settings</h1>

        <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 space-y-4">
          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Methods</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.payment_methods.map((method) => (
                <span
                  key={method}
                  className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/80 rounded-full text-sm text-white"
                >
                  {method}
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(method)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                placeholder="Add payment method..."
                className="flex-1 px-4 py-2 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
              <button
                type="button"
                onClick={addPaymentMethod}
                className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Auto Approve */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                name="auto_approve_deposit"
                checked={settings.auto_approve_deposit || false}
                onChange={handleChange}
                className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20"
              />
              Auto Approve Deposits
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                name="auto_approve_withdraw"
                checked={settings.auto_approve_withdraw || false}
                onChange={handleChange}
                className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20"
              />
              Auto Approve Withdrawals
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Deposit Fee (%)</label>
              <input
                type="number"
                name="deposit_fee"
                value={settings.deposit_fee || 0}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Withdraw Fee (%)</label>
              <input
                type="number"
                name="withdraw_fee"
                value={settings.withdraw_fee || 0}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default PaymentSettings;
