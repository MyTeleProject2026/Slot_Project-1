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
    <nav className="bottom-nav safe-area-bottom">
      <div className="flex items-center justify-around h-14 md:h-16 max-w-md mx-auto">
        {items.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active ? 'text-primary-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`text-xl transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              <span className={`text-[10px] mt-0.5 transition-all duration-200 ${active ? 'font-medium' : ''}`}>
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
