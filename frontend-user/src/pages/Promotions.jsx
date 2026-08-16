import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaClock, FaPercent, FaArrowRight, FaTrophy, FaCoins } from 'react-icons/fa';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockPromos = [
      {
        id: 1,
        title: 'Welcome Bonus',
        titleTh: 'โบนัสต้อนรับ',
        description: 'Get 100% bonus up to 5,000 THB on first deposit',
        type: 'welcome',
        icon: FaGift,
        color: 'from-purple-600 to-pink-600',
        endDate: '2025-12-31',
        terms: 'Minimum deposit 100 THB. Rollover 10x.',
      },
      {
        id: 2,
        title: 'Daily Cashback',
        titleTh: 'คืนเงินรายวัน',
        description: 'Get 5% cashback on all losses every day',
        type: 'cashback',
        icon: FaCoins,
        color: 'from-blue-600 to-cyan-600',
        endDate: '2025-12-31',
        terms: 'Cashback credited every 24 hours.',
      },
      {
        id: 3,
        title: 'Slot Tournament',
        titleTh: 'ทัวร์นาเมนต์สล็อต',
        description: 'Compete with players and win up to 100,000 THB',
        type: 'tournament',
        icon: FaTrophy,
        color: 'from-orange-600 to-red-600',
        endDate: '2025-12-31',
        terms: 'Based on total bet amount during the period.',
      },
    ];
    setPromotions(mockPromos);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full"></div>
      </div>
    );
  }

  const getTypeColor = (type) => {
    switch(type) {
      case 'welcome': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'cashback': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'tournament': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <FaGift className="text-2xl text-primary-500" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Promotions</h1>
        </div>
        <p className="text-gray-400 mb-4 md:mb-6">Exclusive offers and bonuses for our valued players</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {promotions.map((promo, index) => {
            const Icon = promo.icon;
            return (
              <motion.div
                key={promo.id}
                className="bg-dark-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-700/30 hover:border-primary-500/30 transition-all hover:shadow-xl hover:shadow-primary-500/5 hover:scale-105 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`h-28 md:h-32 bg-gradient-to-r ${promo.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                  <Icon className="text-4xl md:text-5xl text-white/80 relative z-10 drop-shadow-lg" />
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white">{promo.title}</h3>
                      {promo.titleTh && (
                        <p className="text-xs md:text-sm text-gray-400">{promo.titleTh}</p>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getTypeColor(promo.type)} border`}>
                      {promo.type}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm mt-2">{promo.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock /> Ends: {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaPercent /> T&C apply
                    </span>
                  </div>
                  <button className="mt-4 w-full py-2.5 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2 group-hover:scale-105">
                    Claim Now <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Promotions;
