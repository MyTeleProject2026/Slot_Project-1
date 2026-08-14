import React, { useState, useEffect } from 'react';
import { FaGift, FaFire, FaClock } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch promotions - replace with actual API call
    setTimeout(() => {
      setPromotions([
        { id: 1, title: 'Welcome Bonus', description: '100% up to 5,000 THB', type: 'deposit', expiry: '2024-12-31' },
        { id: 2, title: 'Daily Cashback', description: 'Get 5% cashback every day', type: 'cashback', expiry: '2024-12-31' },
        { id: 3, title: 'Slot Tournament', description: 'Win up to 100,000 THB', type: 'tournament', expiry: '2024-12-31' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'text-green-500';
      case 'cashback': return 'text-blue-500';
      case 'tournament': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-4">Promotions</h1>
      
      {loading ? (
        <LoadingSpinner />
      ) : promotions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaGift className="text-6xl mx-auto mb-3 opacity-30" />
          <p>No promotions available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-dark-800 rounded-xl p-5 border border-dark-700 hover:border-primary-500/50 transition group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-500 transition">{promo.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{promo.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-xs font-medium ${getTypeColor(promo.type)}`}>
                      {promo.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaClock className="text-[10px]" /> {promo.expiry}
                    </span>
                  </div>
                </div>
                <FaFire className="text-primary-500/30 group-hover:text-primary-500 transition text-2xl" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Promotions;