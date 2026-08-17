import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaUsers, FaGamepad, FaExchangeAlt,
  FaGift, FaImage, FaLanguage, FaCog, FaHeadset,
  FaSignOutAlt, FaTachometerAlt, FaChevronDown,
  FaChevronUp, FaMoneyBillWave
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    games: true,
    transactions: false,
    promotions: false,
    settings: false,
  });

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      key: 'users',
      icon: FaUsers,
      label: 'Users',
      path: '/users',
    },
    {
      key: 'games',
      icon: FaGamepad,
      label: 'Games',
      children: [
        { label: 'All Games', path: '/games' },
        { label: 'Add Game', path: '/games/add' },
        { label: 'Game Control', path: '/games/control' },
      ],
    },
    {
      key: 'transactions',
      icon: FaExchangeAlt,
      label: 'Transactions',
      children: [
        { label: 'All Transactions', path: '/transactions' },
        { label: 'Deposits', path: '/transactions/deposits' },
        { label: 'Withdrawals', path: '/transactions/withdrawals' },
      ],
    },
    {
      key: 'promotions',
      icon: FaGift,
      label: 'Promotions',
      children: [
        { label: 'All Promotions', path: '/promotions' },
        { label: 'Add Promotion', path: '/promotions/add' },
      ],
    },
    {
      key: 'banners',
      icon: FaImage,
      label: 'Banners',
      path: '/banners',
    },
    {
      key: 'languages',
      icon: FaLanguage,
      label: 'Languages',
      path: '/languages',
    },
    {
      key: 'settings',
      icon: FaCog,
      label: 'Settings',
      children: [
        { label: 'General', path: '/settings/general' },
        { label: 'Appearance', path: '/settings/appearance' },
        { label: 'Payment', path: '/settings/payment' },
        { label: 'Countries', path: '/settings/countries' },
      ],
    },
    {
      key: 'support',
      icon: FaHeadset,
      label: 'Support Chat',
      path: '/support',
    },
  ];

  return (
    <div className={`flex flex-col h-full w-full bg-dark-900/95 backdrop-blur-xl border-r border-dark-800/50 ${isOpen ? 'block' : 'hidden lg:block'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-dark-800/50 flex items-center justify-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">FattBet</span>
          <span className="text-xs text-gray-500">Super Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedMenus[item.key];
            const Icon = item.icon;
            return (
              <div key={item.key} className="mb-1">
                <button
                  onClick={() => toggleMenu(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isExpanded
                      ? 'bg-gradient-to-r from-primary-500/20 to-orange-500/20 text-primary-500'
                      : 'text-gray-400 hover:bg-dark-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                          isActive(child.path)
                            ? 'bg-primary-500/10 text-primary-500'
                            : 'text-gray-400 hover:bg-dark-800/50 hover:text-white'
                        }`}
                        onClick={onClose}
                      >
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-primary-500/20 to-orange-500/20 text-primary-500'
                  : 'text-gray-400 hover:bg-dark-800/50 hover:text-white'
              }`}
              onClick={onClose}
            >
              <Icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-dark-800/50">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <FaSignOutAlt /> <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
