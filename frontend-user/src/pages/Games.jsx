import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import ProviderFilter from '../components/games/ProviderFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaFilter } from 'react-icons/fa';

const Games = () => {
  const location = useLocation();
  const { games, loading, fetchGames, searchGames, providers, fetchProviders } = useGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const provider = params.get('provider');
    if (category) setSelectedCategory(category);
    if (provider) setSelectedProvider(provider);
    fetchGames({ category, provider });
    fetchProviders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchGames(searchQuery);
    } else {
      fetchGames();
    }
  };

  const handleFilter = (type, value) => {
    if (type === 'category') {
      setSelectedCategory(value);
      fetchGames({ category: value, provider: selectedProvider });
    } else if (type === 'provider') {
      setSelectedProvider(value);
      fetchGames({ category: selectedCategory, provider: value });
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedProvider('');
    setSearchQuery('');
    fetchGames();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">All Games</h1>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-dark-800 text-white rounded-lg px-4 py-2 pl-10 border border-dark-700 focus:border-primary-500 focus:outline-none transition"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-500 text-dark-900 rounded-lg font-medium hover:bg-primary-400 transition">
            Search
          </button>
        </form>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg hover:bg-dark-700 transition flex items-center gap-2"
        >
          <FaFilter /> Clear Filters
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['All', 'slots', 'live', 'sports', 'fishing', 'lotto'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter('category', cat === 'All' ? '' : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              (cat === 'All' && !selectedCategory) || selectedCategory === cat
                ? 'bg-primary-500 text-dark-900'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Provider Filter Component */}
      <ProviderFilter
        providers={providers}
        selectedProvider={selectedProvider}
        onSelect={(providerName) => handleFilter('provider', providerName)}
        loading={loading}
      />

      {/* Games Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : games.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No games found matching your criteria.</p>
          <button onClick={clearFilters} className="mt-4 text-primary-500 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;