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
      case 'welcome': return 'bg-purple-500/10 text-purple-400 border
