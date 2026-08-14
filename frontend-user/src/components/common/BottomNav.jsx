import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaGamepad, FaGift, FaWallet, FaUser } from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const items = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/games', icon: FaGamepad, label: 'Games' },
    { path: '/promotions', icon: FaGift, label: 'Promos' },
    { path: '/wallet', icon: FaWallet, label: 'Wallet' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900 border-t border-dark-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-primary-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`text-xl ${active ? 'scale-110' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-medium' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
