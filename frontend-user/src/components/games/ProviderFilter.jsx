import React from 'react';

const ProviderFilter = ({ providers, selectedProvider, onSelect }) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onSelect('')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
          !selectedProvider ? 'bg-primary-500 text-dark-900' : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
        }`}
      >
        All
      </button>
      {providers.map((provider) => (
        <button
          key={provider.id || provider.name}
          onClick={() => onSelect(provider.name === selectedProvider ? '' : provider.name)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            provider.name === selectedProvider
              ? 'bg-primary-500 text-dark-900'
              : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
          }`}
        >
          {provider.name} <span className="opacity-60">({provider.game_count || 0})</span>
        </button>
      ))}
    </div>
  );
};

export default ProviderFilter;