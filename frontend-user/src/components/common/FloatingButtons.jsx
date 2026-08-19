import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaTelegram, FaHeadset, FaChevronUp, FaGift } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const FloatingButtons = () => {
  const { isAuthenticated } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Read from environment variables
  const whatsappUrl = process.env.REACT_APP_WHATSAPP_URL || 'https://wa.me/1234567890';
  const telegramUrl = process.env.REACT_APP_TELEGRAM_URL || 'https://t.me/fattbet';
  const supportUrl = process.env.REACT_APP_SUPPORT_URL || '/support';

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-3">
      {isAuthenticated && (
        <Link to="/lucky-draw" className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse">
          <FaGift className="text-xl" />
        </Link>
      )}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <FaTelegram className="text-2xl" />
      </a>
      <Link
        to={supportUrl}
        className="w-12 h-12 rounded-full bg-primary-500 text-dark-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <FaHeadset className="text-2xl" />
      </Link>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-dark-800 text-white flex items-center justify-center shadow-lg hover:bg-dark-700 transition-transform animate-fade-in"
        >
          <FaChevronUp className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;
