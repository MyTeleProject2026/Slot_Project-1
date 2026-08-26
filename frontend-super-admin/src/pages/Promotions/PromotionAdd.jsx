import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PromotionAdd = () => {
  const navigate = useNavigate();
  const { addPromotion } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', title_my: '', title_th: '', description: '', description_my: '', description_th: '',
    country_code: 'MM', currency: 'MMK', language: 'my', type: 'welcome', bonus_type: 'percentage',
    bonus_value: 100, max_bonus: 5000, min_deposit: 100, rollover: 10, start_date: '', end_date: '',
    is_active: true, is_featured: false,
  });
  const handleChange = (e) => { const { name, value, type, checked } = e.target; setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { await addPromotion(formData); navigate('/promotions'); } catch (error) {} finally { setLoading(false); } };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="w-full max-w-3xl"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button onClick={() => navigate('/promotions')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"><FaArrowLeft /> Back to Promotions</button>
      <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Add Myanmar Promotion</h1>
      <p className="text-gray-400 mb-6">This promotion is published for Myanmar players in MMK.</p>
      <form onSubmit={handleSubmit} className="bg-dark-800/80 rounded-2xl p-6 border border-dark-700/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-300 mb-1">Country</label><input value="Myanmar" readOnly className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white" /></div>
          <div><label className="block text-sm text-gray-300 mb-1">Currency</label><input value="MMK" readOnly className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white" /></div>
        </div>
        <input name="title" value={formData.title} onChange={handleChange} required placeholder="Title (English)" className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white" />
        <input name="title_my" value={formData.title_my} onChange={handleChange} placeholder="ခေါင်းစဉ် (မြန်မာ)" className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description (English)" rows="3" className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white" />
        <textarea name="description_my" value={formData.description_my} onChange={handleChange} placeholder="ဖော်ပြချက် (မြန်မာ)" rows="3" className="w-full px-4 py-3 bg-dark-700/80 border border-dark-600 rounded-xl text-white" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select name="type" value={formData.type} onChange={handleChange} className="px-3 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white"><option value="welcome">Welcome</option><option value="deposit">Deposit</option><option value="cashback">Cashback</option><option value="rebate">Rebate</option><option value="referral">Referral</option><option value="vip">VIP</option><option value="lucky-draw">Lucky Draw</option></select>
          <select name="bonus_type" value={formData.bonus_type} onChange={handleChange} className="px-3 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white"><option value="percentage">Percentage</option><option value="fixed">Fixed MMK</option></select>
          <input type="number" name="bonus_value" value={formData.bonus_value} onChange={handleChange} className="px-3 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white" placeholder="Bonus" />
          <input type="number" name="max_bonus" value={formData.max_bonus} onChange={handleChange} className="px-3 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white" placeholder="Max MMK" />
        </div>
        <div className="grid grid-cols-2 gap-4"><input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} required className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white" /><input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} required className="px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white" /></div>
        <div className="flex gap-5"><label className="text-gray-300"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active</label><label className="text-gray-300"><input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} /> Featured</label></div>
        <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold flex items-center justify-center gap-2"><FaSave /> Create Myanmar Promotion</button>
      </form>
    </motion.div></div>
  );
};
export default PromotionAdd;
