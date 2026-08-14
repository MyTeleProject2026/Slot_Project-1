import React from 'react';
import { FaCheck } from 'react-icons/fa';

const ProviderFilter = ({ providers, selectedProvider, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-20 h-8 bg-dark-700 rounded-full animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Providers</h3>
      <div className="flex flex-wrap gap-2">
        {/* All Providers Option */}
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            !selectedProvider
              ? 'bg-primary-500 text-dark-900 shadow-lg shadow-primary-500/25'
              : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
          }`}
        >
          All
        </button>

        {/* Individual Providers */}
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              selectedProvider === provider.name
                ? 'bg-primary-500 text-dark-900 shadow-lg shadow-primary-500/25'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            {selectedProvider === provider.name && <FaCheck className="text-[10px]" />}
            {provider.name}
            <span className="opacity-50 text-[10px]">({provider.game_count || 0})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProviderFilter;