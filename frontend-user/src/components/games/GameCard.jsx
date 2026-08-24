import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useGames } from '../../hooks/useGames';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const getName = (game) => game?.name && game.name !== 'Unknown Game' ? game.name : game?.aliases?.[0]?.name || 'Unknown Game';
const getProvider = (game) => game?.provider && game.provider !== 'unknown' ? game.provider : game?.aliases?.[0]?.prov || 'Unknown Provider';
const getRtp = (game) => {
  if (game?.rtpOverride != null) return Number(game.rtpOverride);
  if (Array.isArray(game?.rtp) && game.rtp.length) return Number(game.rtp[game.rtp.length - 1]);
  return typeof game?.rtp === 'number' ? Number(game.rtp) : null;
};
const initials = (name) => String(name || 'SLOTOPOL').split(/\s+/).map((p) => p[0]).join('').slice(0, 4).toUpperCase();

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorite } = useGames();
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!game || typeof game !== 'object') return <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center text-sm text-slate-500">Game unavailable</div>;

  const name = getName(game);
  const provider = getProvider(game);
  const rtp = getRtp(game);
  const image = game.image_url || game.image || '';
  const hasImage = Boolean(image) && !imageError;
  const favorite = isFavorite(game.id);
  const reels = Number(game.reels || game.raw?.sx || 0);
  const rows = Number(game.rows || game.raw?.sy || 0);

  const play = (event) => {
    event?.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to play');
      return;
    }
    navigate(`/play/${encodeURIComponent(game.id)}`);
  };

  const favoriteClick = (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    toggleFavorite(game.id);
  };

  return (
    <motion.article
      onClick={play}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -5 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f18] shadow-xl"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-900 via-[#101629] to-black">
        {hasImage ? (
          <img src={image} alt={name} loading="lazy" onError={() => setImageError(true)} className={`h-full w-full object-cover transition duration-500 ${hovered ? 'scale-105' : ''}`} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-amber-300/25 bg-gradient-to-br from-amber-300/20 via-fuchsia-500/10 to-slate-900 shadow-[0_0_45px_rgba(245,158,11,.12)]">
              <span className="text-xl font-black tracking-wider text-amber-100">{initials(provider)}</span>
            </div>
            <div className="max-w-[90%] text-lg font-black text-white">{name}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[.25em] text-slate-500">{provider}</div>
            <div className="mt-5 rounded-full border border-white/10 bg-white/[.03] px-3 py-1 text-[9px] uppercase tracking-[.18em] text-slate-500">Server game · no fake artwork</div>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <span className="rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur">{provider}</span>
          <button onClick={favoriteClick} aria-label="Toggle favorite" className="rounded-full border border-white/10 bg-black/60 p-2 backdrop-blur hover:bg-black/80">{favorite ? <FaHeart className="text-red-400" /> : <FaRegHeart className="text-white/70" />}</button>
        </div>

        <div className={`absolute inset-0 flex items-center justify-center bg-black/45 transition duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: .96 }} onClick={play} className="rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-slate-950 shadow-2xl"><FaPlay className="mr-2 inline text-xs"/>PLAY</motion.button>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-black text-white">{name}</h3><div className="mt-1 truncate text-[9px] uppercase tracking-[.18em] text-slate-500">{provider} · {game.id}</div></div><div className="shrink-0 rounded-lg bg-white/[.04] px-2 py-1 text-[9px] text-slate-500">{reels && rows ? `${reels}×${rows}` : '—'}</div></div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500"><span>RTP {Number.isFinite(rtp) ? `${rtp.toFixed(2)}%` : 'N/A'}</span><span>{Number(game.lines || game.raw?.ln || 0) || '—'} lines</span></div>
      </div>
    </motion.article>
  );
};

export default GameCard;
