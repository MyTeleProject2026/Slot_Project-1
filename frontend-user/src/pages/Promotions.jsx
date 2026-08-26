import React, { useEffect, useState } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { motion } from 'framer-motion';
import { FaGift, FaClock, FaPercent } from 'react-icons/fa';

const Promotions = () => {
  const { currency } = useCountry();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/promotions?country=MM&currency=${encodeURIComponent(currency || 'MMK')}`, { signal: controller.signal })
      .then(async r => { const data = await r.json(); if (!r.ok || !data.success) throw new Error(data.error || 'Failed to load promotions'); return data; })
      .then(data => setPromotions(Array.isArray(data.promotions) ? data.promotions : []))
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [currency]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full" /></div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  return <div className="w-full"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-center gap-3 mb-2"><FaGift className="text-2xl text-primary-500" /><h1 className="text-2xl md:text-3xl font-bold gradient-text">Myanmar Promotions</h1></div>
    <p className="text-gray-400 mb-6">Current offers for Myanmar players • MMK</p>
    {promotions.length === 0 ? <div className="bg-dark-800/80 rounded-2xl p-8 text-center text-gray-400">No active promotions are available right now.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">{promotions.map((promo, index) => <motion.article key={promo.id} className="bg-dark-800/80 rounded-2xl overflow-hidden border border-dark-700/30" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}><div className="h-28 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center"><FaGift className="text-5xl text-white/80" /></div><div className="p-5"><h3 className="text-xl font-bold text-white">{promo.title_my || promo.title}</h3><p className="text-gray-300 text-sm mt-2">{promo.description_my || promo.description}</p><div className="flex items-center gap-4 mt-3 text-xs text-gray-500"><span><FaClock className="inline mr-1" />Ends: {new Date(promo.end_date).toLocaleDateString()}</span><span><FaPercent className="inline mr-1" />MMK</span></div></div></motion.article>)}</div>}
  </motion.div></div>;
};
export default Promotions;
