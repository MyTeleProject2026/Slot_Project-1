import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaPlus, FaTrash, FaFlag } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DEFAULT_COUNTRIES = [
  { code: 'MM', name: 'Myanmar', currency: 'MMK', is_active: true },
  { code: 'TH', name: 'Thailand', currency: 'THB', is_active: false },
  { code: 'US', name: 'United States', currency: 'USD', is_active: false },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', is_active: false },
];

const CURRENCIES = ['MMK', 'THB', 'USD', 'EUR', 'GBP', 'JPY'];

const CountrySettings = () => {
  const { getSettings, updateSettings } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);
  const [newCountry, setNewCountry] = useState({ code: '', name: '', currency: 'MMK', is_active: true });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings('countries');
      if (data.settings?.countries?.length) setCountries(data.settings.countries);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally { setLoading(false); }
  };

  const handleCountryChange = (index, field, value) => {
    const updated = [...countries];
    updated[index] = { ...updated[index], [field]: value };
    setCountries(updated);
  };

  const addCountry = () => {
    const code = newCountry.code.trim().toUpperCase();
    const name = newCountry.name.trim();
    if (!code || !name || countries.some(c => c.code === code)) return;
    setCountries([...countries, { ...newCountry, code, name }]);
    setNewCountry({ code: '', name: '', currency: 'MMK', is_active: true });
  };

  const removeCountry = (index) => setCountries(countries.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Myanmar/MMK remains the primary N999Bet deployment profile.
      const normalized = countries.map(country => ({ ...country, code: String(country.code).toUpperCase(), currency: String(country.currency).toUpperCase() }));
      await updateSettings('countries', { countries: normalized });
      toast.success('Country settings saved successfully!');
    } catch (error) {
      // Error handled in context
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <FaFlag className="text-2xl text-primary-500" />
          <div><h1 className="text-2xl md:text-3xl font-bold gradient-text">Country & Currency Settings</h1><p className="text-gray-400 text-sm mt-1">N999Bet default deployment: Myanmar / MMK</p></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 space-y-4">
          <div className="space-y-3">
            {countries.map((country, index) => (
              <div key={`${country.code}-${index}`} className="grid grid-cols-1 md:grid-cols-[70px_1fr_110px_auto_auto] items-center gap-3 p-3 bg-dark-700/30 rounded-xl">
                <input type="text" value={country.code} onChange={(e) => handleCountryChange(index, 'code', e.target.value.toUpperCase())} maxLength={3} placeholder="Code" className="w-full px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
                <input type="text" value={country.name} onChange={(e) => handleCountryChange(index, 'name', e.target.value)} placeholder="Name" className="w-full px-3 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
                <select value={country.currency} onChange={(e) => handleCountryChange(index, 'currency', e.target.value)} className="w-full px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm">{CURRENCIES.map(currency => <option key={currency} value={currency}>{currency}</option>)}</select>
                <label className="flex items-center gap-1 text-sm text-gray-300 whitespace-nowrap"><input type="checkbox" checked={country.is_active} onChange={(e) => handleCountryChange(index, 'is_active', e.target.checked)} className="w-4 h-4" /> Active</label>
                <button type="button" onClick={() => removeCountry(index)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"><FaTrash className="text-xs" /></button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[70px_1fr_110px_auto] items-center gap-2 p-3 bg-dark-700/20 rounded-xl border border-dashed border-dark-600">
            <input type="text" value={newCountry.code} onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value })} maxLength={3} placeholder="Code" className="w-full px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
            <input type="text" value={newCountry.name} onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })} placeholder="Country Name" className="w-full px-3 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
            <select value={newCountry.currency} onChange={(e) => setNewCountry({ ...newCountry, currency: e.target.value })} className="w-full px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm">{CURRENCIES.map(currency => <option key={currency} value={currency}>{currency}</option>)}</select>
            <button type="button" onClick={addCountry} className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition"><FaPlus /></button>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><FaSave /> {saving ? 'Saving...' : 'Save Country Settings'}</button>
        </form>
      </motion.div>
    </div>
  );
};

export default CountrySettings;
