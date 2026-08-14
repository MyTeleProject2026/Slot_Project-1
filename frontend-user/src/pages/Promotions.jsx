import React, { useState, useEffect } from 'react';
import { FaGift, FaClock, FaPercent } from 'react-icons/fa';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockPromos = [
      {
        id: 1,
        title: 'Welcome Bonus',
        description: 'Get 100% bonus up to 5,000 THB on first deposit',
        type: 'welcome',
        image: '/assets/promo1.jpg',
        endDate: '2025-12-31',
      },
      {
        id: 2,
        title: 'Daily Cashback',
        description: 'Get 5% cashback on all losses every day',
        type: 'cashback',
        image: '/assets/promo2.jpg',
        endDate: '2025-12-31',
      },
      {
        id: 3,
        title: 'Slot Tournament',
        description: 'Compete with players and win up to 100,000 THB',
        type: 'tournament',
        image: '/assets/promo3.jpg',
        endDate: '2025-12-31',
      },
    ];
    setPromotions(mockPromos);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center text-gray-400">Loading promotions...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Promotions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-dark-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300">
            <div className="h-40 bg-gradient-to-r from-primary-500/20 to-orange-500/20 flex items-center justify-center">
              <FaGift className="text-5xl text-primary-500" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-white">{promo.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{promo.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1 text-primary-500">
                  <FaPercent /> {promo.type}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <FaClock /> {new Date(promo.endDate).toLocaleDateString()}
                </span>
              </div>
              <button className="mt-4 w-full py-2 bg-primary-500 text-dark-900 rounded-lg font-semibold hover:bg-primary-400 transition">
                Claim Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promotions;
