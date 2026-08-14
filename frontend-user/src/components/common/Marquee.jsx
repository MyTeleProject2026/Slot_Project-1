import React, { useState, useEffect } from 'react';
import { FaBullhorn } from 'react-icons/fa';

const Marquee = () => {
  const [messages] = useState([
    '🎉 Welcome to FattBet! Enjoy the best gaming experience!',
    '💰 New players get 100% welcome bonus up to 5,000 THB!',
    '🏆 Daily tournaments with huge prizes! Join now!',
    '📱 Play on mobile and win big anywhere, anytime!',
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentIndex(prev => (prev + 1) % messages.length), 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-dark-800/50 border-y border-dark-700 py-2 overflow-hidden">
      <div className="container mx-auto px-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center gap-2">
            <FaBullhorn className="text-primary-500 animate-pulse" />
            <span className="text-primary-500 font-semibold text-sm hidden sm:inline">Announcement:</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap animate-marquee inline-block">
              {messages.map((msg, idx) => (
                <span key={idx} className="mx-8 text-gray-300 text-sm">{msg}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @media (max-width: 640px) {
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-150%); }
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;