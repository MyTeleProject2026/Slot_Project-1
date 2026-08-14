import React, { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const GameCard = ({ game, onPlay }) => {
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to play');
      return;
    }
    if (onPlay) onPlay(game);
  };

  return (
    <div
      className="relative bg-dark-800 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] bg-dark-900 overflow-hidden">
        {game.image_url ? (
          <img src={game.image_url} alt={game.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
            <span className="text-4xl opacity-20">🎰</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.is_hot && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">HOT</span>}
          {game.is_new && <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">NEW</span>}
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] rounded-full">{game.provider_name}</span>
        </div>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="px-6 py-3 bg-primary-500 text-dark-900 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-primary-400 transition transform hover:scale-105">
            <FaPlay className="text-xs" /> PLAY
          </button>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="text-sm font-semibold truncate">{game.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">RTP: {game.rtp}%</span>
          <span className="text-xs text-primary-400 font-bold">{game.max_multiplier}x</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;