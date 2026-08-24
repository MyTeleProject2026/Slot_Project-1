import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaArrowLeft, FaCoins, FaDice } from 'react-icons/fa';
import toast from 'react-hot-toast';

const rtpDisplay = (game) => {
  if (game?.rtpOverride != null && Number.isFinite(Number(game.rtpOverride))) return Number(game.rtpOverride).toFixed(2);
  if (Array.isArray(game?.rtp) && game.rtp.length) return Number(game.rtp[game.rtp.length - 1]).toFixed(2);
  if (typeof game?.rtp === 'number') return game.rtp.toFixed(2);
  return 'N/A';
};

const errorMessage = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;

const getResult = (response) => response?.result || response?.data?.result || response?.data || response || {};

const normalizeReels = (result) => {
  const reels = result?.game?.reels || result?.reels || result?.game?.symbols || result?.symbols;
  if (!Array.isArray(reels)) return [];
  return reels.map((reel) => Array.isArray(reel) ? reel : [reel]);
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
      const response = await startGame(game.id, bet, 20);
      const data = response?.data || response || {};
      const sessionId = data.sessionId || data.session?.id || data.session?.gid || data.gid;
      if (data.success === false || !sessionId) {
        throw new Error(data.error || 'Slotopol could not create a game session');
      }
      setSession({
        localSessionId: sessionId,
        slotopolGameId: data.session?.gid || data.gid || sessionId,
        gameState: data.session?.game || data.game || null,
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
      const response = await spin(session.localSessionId, bet, 20);
      const data = response?.data || response || {};
      if (data.success === false) throw new Error(data.error || 'Spin failed');
      const result = getResult(data);
      setSpinResult(result);
      await refreshBalance();
      const gain = Number(result?.gain ?? data?.gain ?? 0);
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
      const data = response?.data || response || {};
      if (data.success === false) throw new Error(data.error || 'Collect failed');
      await refreshBalance();
      setSpinResult(null);
      toast.success(t('common.confirm'));
    } catch (error) {
      const message = errorMessage(error, 'Collect failed');
      toast.error(message);
    } finally {
      setIsPlaying(false);
    }
  };

  const currentBalance = Number(balance?.main || 0);
  const reels = useMemo(() => normalizeReels(spinResult), [spinResult]);
  const gain = Number(spinResult?.gain || 0);

  if (loading || (!game && !gameError)) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;
  if (gameError) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center text-gray-400"><p className="text-xl">{gameError}</p><button onClick={() => navigate('/games')} className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg">{t('common.back')}</button></div></div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <button onClick={() => navigate('/games')} className="text-gray-400 hover:text-white transition flex items-center gap-2 mb-4"><FaArrowLeft /> {t('common.back')}</button>
      <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl border border-dark-700/30 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <div><h1 className="text-2xl font-bold text-white">{game.name}</h1><span className="text-sm text-gray-400">{game.provider || 'Slotopol'}</span></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/50 rounded-xl"><FaCoins className="text-yellow-500" /><span className="text-white font-semibold">{currentBalance.toLocaleString()}</span></div>
        </div>

        {startError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm flex items-center gap-2"><span>⚠️ {startError}</span><button onClick={handleStartGame} disabled={isPlaying} className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 rounded-lg">{t('common.retry')}</button></div>}

        <div className="bg-dark-900/50 rounded-xl p-4 md:p-6 mb-4 min-h-[250px] flex items-center justify-center">
          {spinResult ? (
            <div className="text-center w-full">
              {reels.length ? <div className="flex justify-center gap-2 overflow-x-auto py-2">{reels.map((reel, i) => <div key={i} className="flex flex-col gap-1 bg-dark-800 p-2 rounded-lg">{reel.map((symbol, j) => <div key={j} className="w-10 h-10 bg-dark-700 rounded flex items-center justify-center text-sm text-white">{String(symbol)}</div>)}</div>)}</div> : <div className="text-6xl mb-4">🎰</div>}
              <div className={`text-3xl font-bold ${gain > 0 ? 'text-primary-500' : 'text-white'}`}>{gain > 0 ? `+${gain.toFixed(2)}` : 'Spin complete'}</div>
              <div className="mt-4 flex gap-2 justify-center"><button onClick={handleSpin} disabled={isPlaying} className="px-6 py-2 bg-primary-500 text-dark-900 rounded-lg font-semibold disabled:opacity-50">{isPlaying ? t('game.launching') : t('game.play')}</button><button onClick={handleCollect} disabled={isPlaying} className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50">{t('common.confirm')}</button></div>
            </div>
          ) : (
            <div className="text-center text-gray-500"><span className="text-6xl block mb-3">🎰</span><p className="text-lg">{isPlaying ? t('game.launching') : 'Game ready'}</p>{session && <button onClick={handleSpin} disabled={isPlaying} className="mt-4 px-6 py-2 bg-primary-500 text-dark-900 rounded-lg font-semibold disabled:opacity-50"><FaDice className="inline mr-2" /> {isPlaying ? t('game.launching') : t('game.play')}</button>}</div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 items-center"><div className="flex items-center gap-2"><label className="text-gray-400 text-sm">{t('history.amount')}:</label><input type="number" value={bet} onChange={e => setBet(Math.max(Number(game.minBet || 0.1), parseFloat(e.target.value) || Number(game.minBet || 0.1)))} min={game.minBet || 0.1} max={game.maxBet || 100} step="0.1" className="w-24 bg-dark-900 text-white rounded-lg px-3 py-2 border border-dark-700" /></div>{!session && <button onClick={handleStartGame} disabled={isPlaying} className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-dark text-dark-900 rounded-lg font-semibold">{isPlaying ? t('game.launching') : t('common.playNow')}</button>}<div className="text-sm text-gray-500 ml-auto">20 {t('history.type')}</div></div>
        <div className="mt-4 text-xs text-gray-500 border-t border-dark-700/50 pt-4 flex flex-wrap gap-4"><span>{t('game.rtp')}: {rtpDisplay(game)}%</span><span>Provider: {game.provider || 'Slotopol'}</span><span>Game ID: {game.id}</span></div>
      </div>
    </div>
  );
};

export default Play;
