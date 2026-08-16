import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import ProviderFilter from '../components/games/ProviderFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Games = () => {
  const location = useLocation();
  const { games, loading, fetchGames, searchGames, providers, fetchProviders } = useGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const provider = params.get('provider');
    const search = params.get('search');
    if (category) setSelectedCategory(category);
    if (provider) setSelectedProvider(provider);
    if (search) setSearchQuery(search);
    fetchGames({ category, provider, search });
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

  const categories = ['All', 'slots', 'live', 'sports', 'fishing', 'lotto'];

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold gradient-text mb-6">All Games</h1>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        className="flex flex-col md:flex-row gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-dark-800/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 pl-11 border border-dark-700/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105">
            Search
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-3 bg-dark-800/80 backdrop-blur-sm text-gray-300 rounded-xl hover:bg-dark-700/80 transition-all flex items-center gap-2 border border-dark-700/50"
        >
          <FaFilter /> Filters
          {(selectedCategory || selectedProvider) && (
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
          )}
        </button>
        {(selectedCategory || selectedProvider || searchQuery) && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2 border border-red-500/20"
          >
            <FaTimes /> Clear
          </button>
        )}
      </motion.div>

      {/* Category Filters */}
      <motion.div 
        className="flex flex-wrap gap-2 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter('category', cat === 'All' ? '' : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              (cat === 'All' && !selectedCategory) || selectedCategory === cat
                ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 shadow-lg shadow-primary-500/25'
                : 'bg-dark-800/80 backdrop-blur-sm text-gray-300 hover:bg-dark-700/80 border border-dark-700/30'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Provider Filter */}
      {showFilters && providers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <ProviderFilter
            providers={providers}
            selectedProvider={selectedProvider}
            onSelect={(providerName) => handleFilter('provider', providerName)}
            loading={loading}
          />
        </motion.div>
      )}

      {/* Games Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : games.length === 0 ? (
        <motion.div 
          className="text-center py-12 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg">No games found matching your criteria.</p>
          <button onClick={clearFilters} className="mt-4 text-primary-500 hover:underline">
            Clear filters
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Games;
