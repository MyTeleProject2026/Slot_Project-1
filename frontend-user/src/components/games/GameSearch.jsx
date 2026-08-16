import React from 'react';
import { FaSearch } from 'react-icons/fa';

const GameSearch = ({ value, onChange, placeholder = 'Search games...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dark-800/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 pl-11 border border-dark-700/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
      />
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
    </div>
  );
};

export default GameSearch;
