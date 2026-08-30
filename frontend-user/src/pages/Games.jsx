import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import ProviderFilter from '../components/games/ProviderFilter';
import GameSearch from '../components/games/GameSearch';
import GameCategories from '../components/games/GameCategories';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Games = () => {
  const location = useLocation();
  const { games, loading, fetchGames, searchGames, providers, fetchProviders, categories } = useGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimerRef = useRef(null);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const search = query.trim();
      if (search) searchGames(search);
      else fetchGames({ category: selectedCategory || undefined, provider: selectedProvider || undefined });
    }, 250);
  };

  useEffect(() => () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); }, []);

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
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-4 md:mb-6">All Games</h1>
      </motion.div>

      {/* Search & Filters */}
      <motion.div 
        className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GameSearch
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search games..."
          className="flex-1"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-dark-800/80 backdrop-blur-sm text-gray-300 rounded-xl hover:bg-dark-700/80 transition-all flex items-center gap-2 border border-dark-700/50 flex-1 md:flex-none justify-center"
          >
            <FaFilter /> Filters
            {(selectedCategory || selectedProvider) && (
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            )}
          </button>
          {(selectedCategory || selectedProvider || searchQuery) && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2 border border-red-500/20 flex-1 md:flex-none justify-center"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GameCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => handleFilter('category', catId)}
        />
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
          className="game-grid"
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
