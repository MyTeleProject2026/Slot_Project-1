import React, { useEffect } from 'react';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Lotto = () => {
  const { games, loading, getGamesByCategory } = useGames();

  useEffect(() => {
    getGamesByCategory('lotto');
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-4">Lotto</h1>
      {loading ? (
        <LoadingSpinner />
      ) : games.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No lotto games available</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Lotto;