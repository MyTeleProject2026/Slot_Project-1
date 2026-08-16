import React from 'react';

const GameCategories = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id === selectedCategory ? '' : cat.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat.id
              ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25'
              : 'bg-dark-800/80 backdrop-blur-sm text-gray-300 hover:bg-dark-700/80 border border-dark-700/30'
          }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  );
};

export default GameCategories;
