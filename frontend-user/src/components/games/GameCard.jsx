import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useGames } from '../../hooks/useGames';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Helper functions (same as before)
const getGameDisplayName = (game) => {
  if (game.name && game.name !== 'Unknown Game') return game.name;
  if (game.aliases && game.aliases.length > 0) {
    return game.aliases[0].name || 'Unknown Game';
  }
  return 'Unknown Game';
};

const getGameProvider = (game) => {
  if (game.provider && game.provider !== 'unknown') return game.provider;
  if (game.aliases && game.aliases.length > 0) {
    return game.aliases[0].prov || 'Unknown Provider';
  }
  return 'Unknown Provider';
};

const getGameRTP = (game) => {
  if (game.rtpOverride) return game.rtpOverride;
  if (game.rtp && Array.isArray(game.rtp) && game.rtp.length > 0) {
    return game.rtp[game.rtp.length - 1];
  }
  if (typeof game.rtp === 'number') return game.rtp;
  return null;
};

// Generate a simple placeholder SVG with game initials
const generatePlaceholder = (name) => {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23161f33'/%3E%3Ctext x='150' y='200' font-family='Arial' font-size='48' fill='%23d4a745' text-anchor='middle' dominant-baseline='central'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorite } = useGames();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!game || typeof game !== 'object') {
    return (
      <div className="relative bg-dark-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-700/30 aspect-[3/4] flex items-center justify-center">
        <span className="text-gray-500 text-sm">Game unavailable</span>
      </div>
    );
  }

  const displayName = getGameDisplayName(game);
  const provider = getGameProvider(game);
  const rtp = getGameRTP(game);
  const favorite = isFavorite(game.id);

  // Use placeholder if no image URL
  const imageUrl = game.image_url || game.image || generatePlaceholder(displayName);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to play');
      return;
    }
    navigate(`/play/${encodeURIComponent(game.id)}`);
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
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-dark-900 to-dark-800 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer"></div>
        )}
        <img
          src={imageUrl}
          alt={displayName}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)} // fallback to placeholder
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {rtp && rtp > 97 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
              VIP
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
            {provider}
          </span>
        </div>

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <motion.button
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary-500 to-primary-dark text-dark-900 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-primary-500/25"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
          >
            <FaPlay className="text-xs" />
            PLAY
          </motion.button>
        </div>
      </div>

      <div className="p-2 md:p-2.5">
        <h3 className="text-xs md:text-sm font-semibold truncate text-white">
          {displayName}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] md:text-xs text-gray-400">
            RTP: {rtp ? `${rtp.toFixed(2)}%` : 'N/A'}
          </span>
          <span className="text-[10px] md:text-xs text-primary-400 font-bold">
            {game.max_multiplier ? `${game.max_multiplier}x` : '—'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
