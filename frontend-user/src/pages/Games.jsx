import React, { useState, useEffect } from 'react';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import ProviderFilter from '../components/games/ProviderFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Games = () => {
  const { games, loading, fetchGames, providers, fetchProviders } = useGames();
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  useEffect(() => {
    fetchGames();
    fetchProviders();
  }, []);

  useEffect(() => {
    const params = {};
    if (selectedProvider) params.provider = selectedProvider;
    if (search) params.search = search;
    fetchGames(params);
  }, [selectedProvider, search]);

  const filteredGames = games; // already filtered by fetchGames

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-4">All Games</h1>
      
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-dark-800 text-white px-4 py-2 rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
        />
      </div>

      {/* Provider Filter */}
      <ProviderFilter
        providers={providers}
        selectedProvider={selectedProvider}
        onSelect={(provider) => setSelectedProvider(provider === selectedProvider ? '' : provider)}
        className="mb-4"
      />

      {/* Games Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;