import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaGamepad, FaGift, FaWallet, FaUser, 
  FaSignOutAlt, FaHistory, FaTrophy, FaUsers, FaHeadset,
  FaCrown, FaFire, FaDice, FaSync
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useGames } from '../../hooks/useGames';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { balance } = useWallet();
  const { clearCache, fetchGames, fetchProviders } = useGames();
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleClearCache = async () => {
    if (clearCache) {
      clearCache();
    }
    await fetchGames();
    await fetchProviders();
    toast.success('Cache cleared & data refreshed!');
  };

  const menuItems = [
    { path: '/', icon: FaHome, label: t('nav.home') },
    { path: '/games/slots', icon: FaDice, label: t('nav.slots') },
    { path: '/games/live-casino', icon: FaCrown, label: t('nav.liveCasino') },
    { path: '/games/sports', icon: FaFire, label: t('nav.sports') },
    { path: '/games', icon: FaGamepad, label: t('nav.games') },
    { path: '/promotions', icon: FaGift, label: t('nav.promotions') },
    { path: '/wallet', icon: FaWallet, label: t('nav.wallet') },
    { path: '/profile', icon: FaUser, label: t('nav.profile') },
    { path: '/history', icon: FaHistory, label: t('nav.history') },
    { path: '/leaderboard', icon: FaTrophy, label: t('nav.leaderboard') },
    { path: '/referral', icon: FaUsers, label: t('nav.referral') },
    { path: '/support', icon: FaHeadset, label: t('nav.support') },
  ];

  return (
    <div className={`flex flex-col h-full w-full bg-dark-900/95 backdrop-blur-xl border-r border-dark-800/50 ${isOpen ? 'block' : 'hidden lg:block'}`}>
      {/* User Profile */}
      {isAuthenticated && user ? (
        <div className="p-4 border-b border-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-xl font-bold text-dark-900 flex-shrink-0 shadow-lg shadow-primary-500/25">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-white">{user.username}</p>
              <p className="text-sm text-primary-500 font-medium">
                💰 {balance?.main?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-dark-800/50">
          <Link to="/login" className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/30 transition-all hover:scale-105">
            {t('nav.login')}
          </Link>
          <Link to="/register" className="w-full py-2.5 mt-2 border border-dark-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-dark-800/50 transition-all">
            {t('nav.register')}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-500/30">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                active 
                  ? 'bg-gradient-to-r from-primary-500/20 to-orange-500/20 text-primary-500 shadow-lg shadow-primary-500/10' 
                  : 'text-gray-400 hover:bg-dark-800/50 hover:text-white hover:translate-x-1'
              }`}
              onClick={onClose}
            >
              <Icon className={`text-lg ${active ? 'text-primary-500' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-dark-800/50">
        <div className="mb-2">
          <LanguageSwitcher className="w-full" />
        </div>

        {isAuthenticated && (
          <button 
            onClick={() => { logout(); onClose?.(); }} 
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all hover:translate-x-1"
          >
            <FaSignOutAlt /> <span className="font-medium">{t('nav.logout')}</span>
          </button>
        )}
        
        <button
          onClick={handleClearCache}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-gray-400 hover:bg-primary-500/10 hover:text-primary-400 transition-all hover:translate-x-1 group"
        >
          <FaSync className="text-sm group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-medium text-sm">{t('nav.clearCache')}</span>
        </button>

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span className="px-2 py-1 rounded-full bg-primary-500/10 text-primary-500">🔒 {t('nav.secure')}</span>
          <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400">🟢 {t('nav.live')}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
