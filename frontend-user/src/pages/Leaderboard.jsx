import React from 'react';
import { useCountry } from '../contexts/CountryContext';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Leaderboard = () => {
  const { currency } = useCountry();
  const { t } = useLanguage();
  const players = [];
  const leaderboardAvailable = false;

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500" />;
    if (rank === 2) return <FaMedal className="text-gray-400" />;
    if (rank === 3) return <FaMedal className="text-amber-700" />;
    return <span className="text-gray-500 text-sm font-bold">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-500/20 border-gray-500/30';
    if (rank === 3) return 'bg-amber-700/20 border-amber-700/30';
    return 'bg-dark-800/50 border-dark-700/30';
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <FaTrophy className="text-2xl text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">{t('leaderboard.title')}</h1>
        </div>
        <p className="text-gray-400 mb-4 md:mb-6">{t('leaderboard.subtitle')}</p>

        {!leaderboardAvailable ? <div className="rounded-2xl border border-dark-700/40 bg-dark-800/70 p-8 text-center text-gray-400">The live leaderboard is not available until the server leaderboard endpoint is enabled. No demo rankings are shown.</div> : <div className="space-y-3">
          {players.map((player) => (
            <motion.div
              key={player.rank}
              className={`flex items-center justify-between p-4 rounded-xl border ${getRankColor(player.rank)} backdrop-blur-sm transition-all hover:scale-[1.02]`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: player.rank * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-center">{getRankIcon(player.rank)}</div>
                <div>
                  <p className="font-medium text-white">{player.name}</p>
                  <p className="text-xs text-gray-400">{t('leaderboard.score')}: {player.score}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-500">{player.reward}</p>
              </div>
            </motion.div>
          ))}
        </div>}
      </motion.div>
    </div>
  );
};

export default Leaderboard;