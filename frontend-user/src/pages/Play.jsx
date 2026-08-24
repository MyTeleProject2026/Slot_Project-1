import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaArrowLeft, FaCoins, FaDice, FaMinus, FaPlus, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';

const rtpDisplay = (game) => {
  if (game?.rtpOverride != null && Number.isFinite(Number(game.rtpOverride))) return Number(game.rtpOverride).toFixed(2);
  if (Array.isArray(game?.rtp) && game.rtp.length) return Number(game.rtp[game.rtp.length - 1]).toFixed(2);
  if (typeof game?.rtp === 'number') return game.rtp.toFixed(2);
  return 'N/A';
};

const errorMessage = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;

const unwrap = (response) => response?.data || response || {};

// Slotopol's real game response contains the current SlotGeneric object.
// Its Grider implementations serialize as { grid: [[...], [...], ...] }.
const getGameState = (data) => data?.session?.game || data?.session?.provider?.game || data?.game || data?.result?.game || data?.result || null;

const getGrid = (state) => {
  const grid = state?.grid || state?.Grid;
  if (!Array.isArray(grid) || !grid.length) return [];
  return grid.map(column => Array.isArray(column) ? column : [column]);
};

const symbolText = (symbol) => {
  if (symbol === null || symbol === undefined) return '•';
  if (typeof symbol === 'object') return symbol.symbol ?? symbol.sym ?? symbol.id ?? '•';
  return String(symbol);
};

const gamePlaceholder = (name) => {
  const safe = String(name || 'Slotopol').replace(/[<>&'\"]/g, '').slice(0, 26);
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs>
      <rect width="600" height="800" fill="url(#g)"/>
      <circle cx="300" cy="300" r="170" fill="#111827" stroke="#f59e0b" stroke-width="8"/>
      <text x="300" y="310" fill="#fbbf24" font-family="Arial" font-size="92" font-weight="700" text-anchor="middle">🎰</text>
      <text x="300" y="540" fill="white" font-family="Arial" font-size="38" font-weight="700" text-anchor="middle">${safe}</text>
      <text x="300" y="600" fill="#9ca3af" font-family="Arial" font-size="25" text-anchor="middle">SLOTOPOL</text>
    </svg>
  `);
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
};

const Play = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { games, loading, startGame, spin, collectWin } = useGames();
  const { balance, refreshBalance } = useWallet();
  const [game, setGame] = useState(null);
  const [session, setSession] = useState(null);
  const [bet, setBet] = useState(1);
  const [spinResult, setSpinResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameError, setGameError] = useState(null);
  const [startError, setStartError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t('game.loginToPlay'));
      navigate('/login');
      return;
    }
    const decodedId = decodeURIComponent(gameId || '');
    const found = games?.find((item) => String(item.id) === decodedId);
    if (found) {
      setGame(found);
      setGameError(null);
    } else if (!loading && games?.length) {
      setGame(null);
      setGameError(t('game.unavailable'));
    }
  }, [games, gameId, loading, navigate, isAuthenticated, t]);

  useEffect(() => {
    if (game && !session && !isPlaying && !startError) handleStartGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const handleStartGame = async () => {
    if (!game || isPlaying) return;
    setIsPlaying(true);
    setStartError(null);
    setSpinResult(null);
    try {
      const response = await startGame(game.id, bet, Math.min(20, Number(game?.raw?.lnum || 20)));
      const data = unwrap(response);
      const sessionId = data.sessionId || data.session?.id;
      const slotopolGid = data.session?.gid || data.gid;
      if (data.success === false || !sessionId || !slotopolGid) {
        throw new Error(data.error || 'Slotopol could not create a game session');
      }
      setSession({
        localSessionId: sessionId,
        slotopolGameId: Number(slotopolGid),
        gameState: getGameState(data),
      });
      await refreshBalance();
    } catch (error) {
      const message = errorMessage(error, t('error.general'));
      setStartError(message);
      toast.error(message);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSpin = async () => {
    if (!session || isPlaying) return;
    setIsPlaying(true);
    setStartError(null);
    try {
      const response = await spin(session.localSessionId, bet, Math.min(20, Number(game?.raw?.lnum || 20)));
      const data = unwrap(response);
      if (data.success === false) throw new Error(data.error || 'Spin failed');
      const result = data.result || data;
      setSpinResult(result);
      setSession(previous => ({ ...previous, gameState: getGameState(result) || previous.gameState }));
      await refreshBalance();
      const gain = Number(result?.gain ?? result?.game?.gain ?? 0);
      if (gain > 0) toast.success(`+${gain.toFixed(2)}`);
    } catch (error) {
      const message = errorMessage(error, 'Spin failed');
      setStartError(message);
      toast.error(message);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCollect = async () => {
    if (!session || isPlaying) return;
    setIsPlaying(true);
    try {
      const response = await collectWin(session.localSessionId);
      const data = unwrap(response);
      if (data.success === false) throw new Error(data.error || 'Collect failed');
      await refreshBalance();
      setSpinResult(null);
      toast.success(t('common.confirm'));
    } catch (error) {
      toast.error(errorMessage(error, 'Collect failed'));
    } finally {
      setIsPlaying(false);
    }
  };

  const currentBalance = Number(balance?.main || 0);
  const activeState = spinResult ? getGameState(spinResult) : session?.gameState;
  const grid = useMemo(() => getGrid(activeState), [activeState]);
  const gain = Number(spinResult?.gain ?? spinResult?.game?.gain ?? 0);
  const imageUrl = game?.image || game?.image_url || gamePlaceholder(game?.name);
  const minBet = Number(game?.minBet || 0.1);
  const maxBet = Number(game?.maxBet || 100);
  const step = minBet < 1 ? 0.1 : 1;

  const adjustBet = (delta) => {
    setBet(previous => Math.min(maxBet, Math.max(minBet, Number((previous + delta).toFixed(2)))));
  };

  if (loading || (!game && !gameError)) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;
  if (gameError) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center text-gray-400"><p className="text-xl">{gameError}</p><button onClick={() => navigate('/games')} className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg">{t('common.back')}</button></div></div>;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
      <button onClick={() => navigate('/games')} className="text-gray-400 hover:text-white transition flex items-center gap-2 mb-4"><FaArrowLeft /> {t('common.back')}</button>
      <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/30 p-3 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={imageUrl} alt={game.name} className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg object-cover border border-dark-700" />
            <div className="min-w-0"><h1 className="text-xl sm:text-2xl font-bold text-white truncate">{game.name}</h1><span className="text-sm text-gray-400">{game.provider || 'Slotopol'}</span></div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/50 rounded-xl"><FaCoins className="text-yellow-500" /><span className="text-white font-semibold">{currentBalance.toLocaleString()}</span></div>
        </div>

        {startError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center gap-2"><span>⚠️ {startError}</span><button onClick={handleStartGame} disabled={isPlaying} className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 rounded-lg">{t('common.retry')}</button></div>}

        <div className="relative bg-gradient-to-b from-slate-950 to-dark-900 rounded-xl p-3 sm:p-5 md:p-7 mb-4 min-h-[330px] sm:min-h-[420px] flex items-center justify-center overflow-hidden border border-dark-700">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-yellow-400 to-primary-500" />
          {grid.length ? (
            <div className="w-full max-w-4xl">
              <div className="grid gap-1.5 sm:gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}>
                {Array.from({ length: Math.max(...grid.map(c => c.length)) }).map((_, row) => grid.map((column, col) => {
                  const symbol = column[row];
                  return <div key={`${col}-${row}`} className="aspect-square rounded-md sm:rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner overflow-hidden"><span className="text-white font-bold text-[clamp(11px,3vw,26px)]">{symbolText(symbol)}</span></div>;
                }))}
              </div>
              <div className="mt-4 flex justify-between text-xs text-gray-500"><span>{game.provider} · {game.name}</span><span>{grid.length} reels</span></div>
            </div>
          ) : (
            <div className="text-center text-gray-500"><img src={imageUrl} alt="" className="w-28 h-36 object-cover rounded-xl mx-auto mb-4 opacity-80" /><p>{isPlaying ? t('game.launching') : session ? 'Ready to spin' : 'Starting Slotopol game…'}</p></div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-dark-900 rounded-xl p-1.5 border border-dark-700">
            <button onClick={() => adjustBet(-step)} disabled={isPlaying || bet <= minBet} className="w-9 h-9 rounded-lg bg-dark-800 text-white disabled:opacity-30"><FaMinus className="mx-auto text-xs" /></button>
            <div className="min-w-[80px] text-center"><div className="text-[10px] text-gray-500">BET</div><div className="text-white font-bold">{bet}</div></div>
            <button onClick={() => adjustBet(step)} disabled={isPlaying || bet >= maxBet} className="w-9 h-9 rounded-lg bg-dark-800 text-white disabled:opacity-30"><FaPlus className="mx-auto text-xs" /></button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!session ? <button onClick={handleStartGame} disabled={isPlaying} className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-dark text-dark-900 rounded-xl font-bold"><FaPlay className="inline mr-2" />{isPlaying ? t('game.launching') : t('common.playNow')}</button> : <button onClick={handleSpin} disabled={isPlaying} className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-dark text-dark-900 rounded-xl font-bold disabled:opacity-50"><FaDice className="inline mr-2" />{isPlaying ? t('game.launching') : t('game.play')}</button>}
            {spinResult && gain > 0 && <button onClick={handleCollect} disabled={isPlaying} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold disabled:opacity-50">{t('common.confirm')}</button>}
          </div>
        </div>

        {spinResult && <div className="mt-4 rounded-xl bg-dark-900/70 border border-dark-700 p-3 text-center"><span className="text-gray-400 text-sm">Last spin</span><div className={`text-2xl font-bold ${gain > 0 ? 'text-green-400' : 'text-white'}`}>{gain > 0 ? `+${gain.toFixed(2)}` : 'No win'}</div></div>}
        <div className="mt-4 text-xs text-gray-500 border-t border-dark-700/50 pt-4 flex flex-wrap gap-4"><span>{t('game.rtp')}: {rtpDisplay(game)}%</span><span>Provider: {game.provider || 'Slotopol'}</span><span>Game ID: {game.id}</span><span>Slotopol session: {session?.slotopolGameId || '—'}</span></div>
      </div>
    </div>
  );
};

export default Play;
