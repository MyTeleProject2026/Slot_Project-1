import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaPlus, FaTrash, FaFlag } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CountrySettings = () => {
  const { getSettings, updateSettings } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([
    { code: 'TH', name: 'Thailand', currency: 'THB', is_active: true },
    { code: 'MM', name: 'Myanmar', currency: 'MMK', is_active: true },
    { code: 'US', name: 'United States', currency: 'USD', is_active: false },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', is_active: false },
  ]);
  const [newCountry, setNewCountry] = useState({ code: '', name: '', currency: 'USD', is_active: true });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings('countries');
      if (data.settings?.countries) {
        setCountries(data.settings.countries);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (index, field, value) => {
    const updated = [...countries];
    updated[index] = { ...updated[index], [field]: value };
    setCountries(updated);
  };

  const addCountry = () => {
    if (newCountry.code.trim() && newCountry.name.trim()) {
      setCountries([...countries, { ...newCountry, code: newCountry.code.toUpperCase() }]);
      setNewCountry({ code: '', name: '', currency: 'USD', is_active: true });
    }
  };

  const removeCountry = (index) => {
    setCountries(countries.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('countries', { countries });
      toast.success('Country settings saved successfully!');
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
        <div className="flex items-center gap-3 mb-6">
          <FaFlag className="text-2xl text-primary-500" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Country Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 space-y-4">
          {/* Country List */}
          <div className="space-y-3">
            {countries.map((country, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-dark-700/30 rounded-xl">
                <input
                  type="text"
                  value={country.code}
                  onChange={(e) => handleCountryChange(index, 'code', e.target.value)}
                  placeholder="Code"
                  className="w-16 px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
                <input
                  type="text"
                  value={country.name}
                  onChange={(e) => handleCountryChange(index, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-3 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
                <select
                  value={country.currency}
                  onChange={(e) => handleCountryChange(index, 'currency', e.target.value)}
                  className="w-24 px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                >
                  <option value="THB">THB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="MMK">MMK</option>
                </select>
                <label className="flex items-center gap-1 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={country.is_active}
                    onChange={(e) => handleCountryChange(index, 'is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500/20"
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => removeCountry(index)}
                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Country */}
          <div className="flex items-center gap-2 p-3 bg-dark-700/20 rounded-xl border border-dashed border-dark-600">
            <input
              type="text"
              value={newCountry.code}
              onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value })}
              placeholder="Code"
              className="w-16 px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <input
              type="text"
              value={newCountry.name}
              onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
              placeholder="Country Name"
              className="flex-1 px-3 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            />
            <select
              value={newCountry.currency}
              onChange={(e) => setNewCountry({ ...newCountry, currency: e.target.value })}
              className="w-24 px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
            >
              <option value="THB">THB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="MMK">MMK</option>
            </select>
            <button
              type="button"
              onClick={addCountry}
              className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition"
            >
              <FaPlus />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Country Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CountrySettings;
