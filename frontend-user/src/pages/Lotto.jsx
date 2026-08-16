import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { useGames } from '../hooks/useGames';
import GameCard from '../components/games/GameCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Lotto = () => {
  const { games, loading, getGamesByCategory, error } = useGames();

  useEffect(() => {
    getGamesByCategory('lotto');
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg hover:bg-primary-400 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="text-gray-400 hover:text-white transition-all hover:translate-x-[-4px]">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Lotto</h1>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No lotto games available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Lotto;
