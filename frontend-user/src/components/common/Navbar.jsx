import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaUser, FaWallet, FaSignOutAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { APP_NAME, getCurrentCountry } from '../../utils/constants';

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { balance } = useWallet();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const country = getCurrentCountry();
  const currencySymbol = country.currencySymbol || '฿';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-xl border-b border-dark-800/50 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onMenuClick} 
              className="lg:hidden p-2 text-white hover:text-primary-500 transition-all hover:scale-110" 
              aria-label="Menu"
            >
              <FaBars className="text-xl" />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-extrabold">
                <span className="text-white">999</span>
                <span className="text-primary-500">Bet</span>
              </span>
            </Link>
          </div>

          {/* Center Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input 
              type="text" 
              placeholder={t('games.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800/80 text-white text-sm rounded-full px-4 py-2 pl-11 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all backdrop-blur-sm border border-dark-700/50 focus:border-primary-500"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          </form>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />

            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition"
              aria-label="Search"
            >
              <FaSearch className="text-lg" />
            </button>

            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 rounded-full border border-primary-500/30 backdrop-blur-sm">
                  <FaWallet className="text-primary-500 text-sm" />
                  <span className="text-white font-medium text-sm">
                    {currencySymbol}{balance?.main?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-dark-800/80 transition-all backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-dark flex items-center justify-center text-dark-900 font-bold text-sm shadow-lg shadow-primary-500/25">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-200">
                      {user?.username}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-dark-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-dark-700/50 py-1 z-50 overflow-hidden">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-700/50 transition-all" onClick={() => setIsDropdownOpen(false)}>
                        <FaUser className="text-primary-500" /> <span>{t('nav.profile')}</span>
                      </Link>
                      <Link to="/wallet" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-700/50 transition-all" onClick={() => setIsDropdownOpen(false)}>
                        <FaWallet className="text-primary-500" /> <span>{t('nav.wallet')}</span>
                      </Link>
                      <hr className="border-dark-700/50 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-red-500/10 transition-all text-red-400">
                        <FaSignOutAlt /> <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Link to="/login" className="px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium text-white hover:text-primary-500 transition-all">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-dark text-dark-900 rounded-full hover:shadow-lg hover:shadow-primary-500/30 transition-all hover:scale-105">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-dark-800/50">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder={t('games.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-800/80 text-white text-sm rounded-full px-4 py-2 pl-11 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all backdrop-blur-sm border border-dark-700/50 focus:border-primary-500"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                <FaTimes className="text-sm" />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
