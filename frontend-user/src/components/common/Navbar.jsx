import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaUser, FaWallet, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-md border-b border-dark-800">
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button onClick={onMenuClick} className="lg:hidden p-2 text-white hover:text-primary-500 transition" aria-label="Menu">
              <FaBars className="text-xl" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="FattBet" className="h-8 md:h-10 w-auto" />
            </Link>
          </div>

          {/* Center Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <input type="text" placeholder="Search games..." className="w-full bg-dark-800 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
                  <FaWallet className="text-primary-500 text-sm" />
                  <span className="text-white font-medium text-sm">{balance?.main?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="relative">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-dark-800 transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-orange-500 flex items-center justify-center text-dark-900 font-bold text-sm">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium">{user?.username}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-xl border border-dark-700 py-1 z-50">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-dark-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <FaUser className="text-primary-500" /> <span>Profile</span>
                      </Link>
                      <Link to="/wallet" className="flex items-center gap-3 px-4 py-2 hover:bg-dark-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <FaWallet className="text-primary-500" /> <span>Wallet</span>
                      </Link>
                      <hr className="border-dark-700 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-dark-700 transition text-red-400">
                        <FaSignOutAlt /> <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-1.5 text-sm font-medium text-white hover:text-primary-500 transition">Login</Link>
                <Link to="/register" className="px-4 py-1.5 text-sm font-medium bg-primary-500 text-dark-900 rounded-full hover:bg-primary-400 transition">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;