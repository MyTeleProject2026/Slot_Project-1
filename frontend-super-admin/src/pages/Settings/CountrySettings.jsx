import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaPlus, FaTrash, FaFlag } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DEFAULT_COUNTRIES = [
  { code: 'MM', name: 'Myanmar', currency: 'MMK', currencySymbol: 'K', locale: 'my-MM', timezone: 'Asia/Yangon', defaultLanguage: 'mm', is_active: true },
  { code: 'TH', name: 'Thailand', currency: 'THB', currencySymbol: '฿', locale: 'th-TH', timezone: 'Asia/Bangkok', defaultLanguage: 'th', is_active: false },
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', locale: 'en-US', timezone: 'America/New_York', defaultLanguage: 'en', is_active: false },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', locale: 'en-GB', timezone: 'Europe/London', defaultLanguage: 'en', is_active: false },
];

const CURRENCIES = ['MMK', 'THB', 'USD', 'EUR', 'GBP', 'JPY'];

const CountrySettings = () => {
  const { getSettings, updateSettings } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);
  const [newCountry, setNewCountry] = useState({ code: '', name: '', currency: 'MMK', currencySymbol: 'K', locale: 'my-MM', timezone: 'Asia/Yangon', defaultLanguage: 'mm', is_active: true });

  useEffect(() => { loadSettings(); }, []);
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings('countries');
      if (data.settings?.countries?.length) setCountries(data.settings.countries);
    } catch (error) { console.error('Failed to load settings:', error); }
    finally { setLoading(false); }
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
    setNewCountry({ code: '', name: '', currency: 'MMK', currencySymbol: 'K', locale: 'my-MM', timezone: 'Asia/Yangon', defaultLanguage: 'mm', is_active: true });
  };
  const removeCountry = (index) => setCountries(countries.filter((_, i) => i !== index));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const normalized = countries.map(country => ({ ...country, code: String(country.code).toUpperCase(), currency: String(country.currency).toUpperCase(), currencySymbol: country.currencySymbol || '', locale: country.locale || `${String(country.code).toLowerCase()}-${String(country.code).toUpperCase()}`, defaultLanguage: country.defaultLanguage || 'en' }));
      await updateSettings('countries', { countries: normalized });
      toast.success('Country and currency settings saved successfully!');
    } catch (error) { /* handled by context */ }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingSpinner />;
  return <div className="w-full max-w-6xl"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <div className="flex items-center gap-3 mb-6"><FaFlag className="text-2xl text-primary-500" /><div><h1 className="text-2xl md:text-3xl font-bold gradient-text">Country, Currency & Language Settings</h1><p className="text-gray-400 text-sm mt-1">N999Bet default deployment: Myanmar / MMK / မြန်မာ</p></div></div>
    <form onSubmit={handleSubmit} className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 space-y-4">
      <div className="space-y-3">{countries.map((country, index) => <div key={`${country.code}-${index}`} className="grid grid-cols-1 md:grid-cols-8 items-center gap-3 p-3 bg-dark-700/30 rounded-xl">
        <input value={country.code} onChange={e=>handleCountryChange(index,'code',e.target.value.toUpperCase())} maxLength={3} placeholder="Code" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <input value={country.name} onChange={e=>handleCountryChange(index,'name',e.target.value)} placeholder="Country" className="px-3 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <select value={country.currency} onChange={e=>handleCountryChange(index,'currency',e.target.value)} className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm">{CURRENCIES.map(currency=><option key={currency}>{currency}</option>)}</select>
        <input value={country.currencySymbol || ''} onChange={e=>handleCountryChange(index,'currencySymbol',e.target.value)} placeholder="Symbol" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <input value={country.locale || ''} onChange={e=>handleCountryChange(index,'locale',e.target.value)} placeholder="Locale" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <input value={country.defaultLanguage || ''} onChange={e=>handleCountryChange(index,'defaultLanguage',e.target.value)} placeholder="Language" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <label className="flex items-center gap-1 text-sm text-gray-300"><input type="checkbox" checked={country.is_active} onChange={e=>handleCountryChange(index,'is_active',e.target.checked)} className="w-4 h-4" /> Active</label>
        <button type="button" onClick={()=>removeCountry(index)} className="p-2 rounded-lg bg-red-500/20 text-red-400"><FaTrash className="text-xs" /></button>
      </div>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-2 p-3 bg-dark-700/20 rounded-xl border border-dashed border-dark-600">
        <input value={newCountry.code} onChange={e=>setNewCountry({...newCountry,code:e.target.value})} maxLength={3} placeholder="Code" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <input value={newCountry.name} onChange={e=>setNewCountry({...newCountry,name:e.target.value})} placeholder="Country Name" className="px-3 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <select value={newCountry.currency} onChange={e=>setNewCountry({...newCountry,currency:e.target.value})} className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm">{CURRENCIES.map(currency=><option key={currency}>{currency}</option>)}</select>
        <input value={newCountry.currencySymbol} onChange={e=>setNewCountry({...newCountry,currencySymbol:e.target.value})} placeholder="Symbol" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <input value={newCountry.locale} onChange={e=>setNewCountry({...newCountry,locale:e.target.value})} placeholder="Locale" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <input value={newCountry.defaultLanguage} onChange={e=>setNewCountry({...newCountry,defaultLanguage:e.target.value})} placeholder="Language" className="px-2 py-2 bg-dark-700/80 border border-dark-600 rounded-lg text-white text-sm" />
        <button type="button" onClick={addCountry} className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg"><FaPlus /></button>
      </div>
      <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><FaSave /> {saving ? 'Saving...' : 'Save Country Settings'}</button>
    </form>
  </motion.div></div>;
};
export default CountrySettings;
