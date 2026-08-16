import React, { useState } from 'react';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useGames } from '../../hooks/useGames';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const GameCard = ({ game }) => {
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorite } = useGames();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Safety check: if game is undefined or null, return a placeholder
  if (!game || typeof game !== 'object') {
    return (
      <div className="relative bg-dark-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-700/30 aspect-[3/4] flex items-center justify-center">
        <span className="text-gray-500 text-sm">Game unavailable</span>
      </div>
    );
  }

  const favorite = isFavorite(game.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to play');
      return;
    }
    toast.success(`Launching ${game.name || 'game'}...`);
    // You can add actual game launch logic here
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    if (game.id) {
      toggleFavorite(game.id);
    }
  };

  return (
    <motion.div
      className="relative bg-dark-800/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover border border-dark-700/30 group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-dark-900 to-dark-800 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer"></div>
        )}
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={game.name || 'Game'}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)} // fallback to show placeholder
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
            <span className="text-6xl opacity-20">🎰</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.is_hot && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg">
              HOT
            </span>
          )}
          {game.is_new && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              NEW
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all z-10"
          aria-label="Toggle favorite"
        >
          {favorite ? (
            <FaHeart className="text-red-500 text-sm animate-pulse" />
          ) : (
            <FaRegHeart className="text-white/70 text-sm hover:text-red-400" />
          )}
        </button>

        {/* Provider name */}
        <div className="absolute bottom-2 left-2 right-2">
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded-full">
            {game.provider_name || 'Unknown Provider'}
          </span>
        </div>

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-orange-500 text-dark-900 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary-500/25"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
          >
            <FaPlay className="text-xs" />
            PLAY
          </motion.button>
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="text-sm font-semibold truncate text-white">
          {game.name || 'Unnamed Game'}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">
            RTP: {game.rtp ? `${game.rtp}%` : 'N/A'}
          </span>
          <span className="text-xs text-primary-400 font-bold">
            {game.max_multiplier ? `${game.max_multiplier}x` : '—'}
          </span>
        </div>
      </div>

      <style>{`
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </motion.div>
  );
};

export default GameCard;
