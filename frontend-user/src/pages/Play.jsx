import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaArrowLeft, FaCoins, FaDice, FaMinus, FaPlus, FaExpand, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import toast from 'react-hot-toast';

const rtpDisplay = (game) => {
  if (game?.rtpOverride != null && Number.isFinite(Number(game.rtpOverride))) return Number(game.rtpOverride).toFixed(2);
  if (Array.isArray(game?.rtp) && game.rtp.length) return Number(game.rtp[game.rtp.length - 1]).toFixed(2);
  if (typeof game?.rtp === 'number') return Number(game.rtp).toFixed(2);
  return 'N/A';
};

const unwrap = (response) => response?.data || response || {};
const errorMessage = (error, fallback) => error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;

const getGameState = (data) => data?.session?.game || data?.session?.provider?.game || data?.game || data?.result?.game || data?.result || null;

const getGrid = (state) => {
  const grid = state?.grid || state?.Grid;
  if (!Array.isArray(grid) || !grid.length) return [];
  return grid.map((reel) => Array.isArray(reel) ? reel : [reel]);
};

// Slotopol returns symbol IDs/numbers. These are presentation-only labels;
// the authoritative symbol positions and results always come from Slotopol.
const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '⭐', '🔔', '7️⃣', '💎', '🍀', '🃏', '👑', '🎁'];
const symbolText = (value) => {
  if (value === null || value === undefined) return '•';
  if (typeof value === 'object') value = value.symbol ?? value.sym ?? value.id ?? value.value;
  const n = Number(value);
  if (Number.isInteger(n) && n >= 0) return SYMBOLS[n % SYMBOLS.length];
  return String(value);
};

const placeholder = (name) => {
  const safe = String(name || 'Slotopol').replace(/[<>&'\"]/g, '').slice(0, 28);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b1020"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><circle cx="300" cy="300" r="170" fill="#111827" stroke="#f59e0b" stroke-width="8"/><text x="300" y="320" fill="#fbbf24" font-family="Arial" font-size="100" text-anchor="middle">🎰</text><text x="300" y="535" fill="white" font-family="Arial" font-size="34" font-weight="700" text-anchor="middle">${safe}</text><text x="300" y="590" fill="#9ca3af" font-family="Arial" font-size="24" text-anchor="middle">SLOTOPOL</text></svg>`)}`;
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t('game.loginToPlay'));
      navigate('/login');
      return;
    }
    const id = decodeURIComponent(gameId || '');
    const found = games?.find((item) => String(item.id) === id);
    if (found) setGame(found);
    else if (!loading && games?.length) setError(t('game.unavailable'));
  }, [games, gameId, loading, navigate, isAuthenticated, t]);

  useEffect(() => {
    if (game && !session && !busy && !error) startSlotopolGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const startSlotopolGame = async () => {
    if (!game || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await startGame(game.id, bet, Math.min(20, Number(game?.raw?.lnum || 20)));
      const data = unwrap(response);
      const localId = data.sessionId || data.session?.id;
      const gid = data.session?.gid || data.gid;
      if (data.success === false || !localId || !gid) throw new Error(data.error || 'Slotopol game session could not be created');
      setSession({ localSessionId: localId, gid: Number(gid), gameState: getGameState(data) });
      await refreshBalance();
    } catch (e) {
      const message = errorMessage(e, 'Unable to start Slotopol game');
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const playSpin = async () => {
    if (!session || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await spin(session.localSessionId, bet, Math.min(20, Number(game?.raw?.lnum || 20)));
      const data = unwrap(response);
      if (data.success === false) throw new Error(data.error || 'Slotopol spin failed');
      const result = data.result || data;
      const state = getGameState(result);
      setSpinResult(result);
      setSession((old) => ({ ...old, gameState: state || old.gameState }));
      await refreshBalance();
      const gain = Number(result?.gain ?? result?.game?.gain ?? 0);
      if (gain > 0) toast.success(`+${gain.toFixed(2)}`);
    } catch (e) {
      const message = errorMessage(e, 'Slotopol spin failed');
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const collect = async () => {
    if (!session || busy) return;
    setBusy(true);
    try {
      const response = await collectWin(session.localSessionId);
      const data = unwrap(response);
      if (data.success === false) throw new Error(data.error || 'Collect failed');
      await refreshBalance();
      setSpinResult(null);
      toast.success(t('common.confirm'));
    } catch (e) {
      toast.error(errorMessage(e, 'Collect failed'));
    } finally {
      setBusy(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const activeState = spinResult ? getGameState(spinResult) : session?.gameState;
  const grid = useMemo(() => getGrid(activeState), [activeState]);
  const gain = Number(spinResult?.gain ?? spinResult?.game?.gain ?? 0);
  const wallet = Number(balance?.main || 0);
  const minBet = Number(game?.minBet || 0.1);
  const maxBet = Number(game?.maxBet || 100);
  const step = minBet < 1 ? 0.1 : 1;
  const image = game?.image || game?.image_url || placeholder(game?.name);

  const adjustBet = (delta) => setBet((value) => Math.min(maxBet, Math.max(minBet, Number((value + delta).toFixed(2)))));

  if (loading || (!game && !error)) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center text-gray-300 px-6"><div><p className="text-xl">{error}</p><button onClick={() => navigate('/games')} className="mt-5 px-6 py-3 bg-primary-500 text-dark-900 rounded-xl font-bold">{t('common.back')}</button></div></div>;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto">
      <header className="sticky top-0 z-20 h-14 sm:h-16 px-3 sm:px-6 bg-slate-950/95 backdrop-blur border-b border-white/10 flex items-center justify-between">
        <button onClick={() => navigate('/games')} className="flex items-center gap-2 text-gray-300 hover:text-white"><FaArrowLeft /><span className="hidden sm:inline">{t('common.back')}</span></button>
        <div className="flex items-center gap-2 min-w-0"><img src={image} alt="" className="w-8 h-8 rounded object-cover"/><div className="min-w-0"><div className="font-bold truncate max-w-[190px] sm:max-w-none">{game.name}</div><div className="text-[10px] text-gray-500">{game.provider || 'Slotopol'} · {game.id}</div></div></div>
        <div className="flex items-center gap-2 sm:gap-4"><button aria-label="Sound" onClick={() => setSound((v) => !v)} className="text-gray-300">{sound ? <FaVolumeUp /> : <FaVolumeMute />}</button><button aria-label="Fullscreen" onClick={toggleFullscreen} className="text-gray-300"><FaExpand /></button><div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"><FaCoins className="text-yellow-400"/><span>{wallet.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div></div>
      </header>

      <main className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
        <section className="w-full max-w-7xl rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          <div className="relative p-2 sm:p-4 md:p-8 min-h-[58vh] sm:min-h-[62vh] flex items-center justify-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-primary-500 to-amber-400" />
            {grid.length ? (
              <div className="w-full max-w-5xl">
                <div className="relative rounded-xl sm:rounded-2xl p-2 sm:p-4 bg-black/50 border border-white/10 shadow-inner">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-black/20 rounded-xl" />
                  <div className="grid gap-1 sm:gap-2 md:gap-3" style={{gridTemplateColumns:`repeat(${grid.length},minmax(0,1fr))`}}>
                    {Array.from({length:Math.max(...grid.map((r)=>r.length))}).flatMap((_, row) => grid.map((reel,col) => {
                      const value = reel[row];
                      return <div key={`${col}-${row}`} className={`aspect-[4/5] min-h-[58px] sm:min-h-[90px] md:min-h-[120px] rounded-md sm:rounded-lg bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-white/10 flex items-center justify-center shadow-lg ${busy ? 'animate-pulse' : ''}`}><span className="text-[clamp(24px,6vw,56px)] select-none">{symbolText(value)}</span></div>;
                    }))}
                  </div>
                </div>
                <div className="flex justify-between mt-2 px-1 text-[10px] sm:text-xs text-gray-500"><span>{game.provider} · {game.name}</span><span>{grid.length} reels</span></div>
              </div>
            ) : (
              <div className="text-center text-gray-400"><img src={image} alt="" className="w-28 h-36 sm:w-36 sm:h-44 object-cover rounded-xl mx-auto mb-4 opacity-80"/><p>{busy ? 'Connecting to Slotopol…' : 'Ready to play'}</p></div>
            )}
          </div>

          {spinResult && <div className="mx-3 sm:mx-6 mb-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center"><div className="text-xs text-gray-500">Last spin</div><div className={`text-xl sm:text-2xl font-black ${gain > 0 ? 'text-emerald-400' : 'text-gray-300'}`}>{gain > 0 ? `WIN +${gain.toFixed(2)}` : 'NO WIN'}</div>{Number(spinResult?.fs ?? spinResult?.game?.fs ?? 0) > 0 && <div className="text-amber-400 text-xs mt-1">Free spins remaining: {Number(spinResult.fs ?? spinResult.game?.fs)}</div>}</div>}

          {error && <div className="mx-3 sm:mx-6 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">⚠️ {error}</div>}

          <div className="p-3 sm:p-5 md:p-6 border-t border-white/10 bg-black/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <div className="text-center"><div className="text-[10px] text-gray-500">BALANCE</div><div className="font-bold text-sm sm:text-base">{wallet.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-1 rounded-xl bg-slate-900 border border-white/10 p-1"><button disabled={busy||bet<=minBet} onClick={()=>adjustBet(-step)} className="w-9 h-9 rounded-lg bg-white/5 disabled:opacity-30"><FaMinus className="mx-auto text-xs"/></button><div className="w-16 text-center"><div className="text-[9px] text-gray-500">BET</div><div className="font-black">{bet.toFixed(minBet<1?1:0)}</div></div><button disabled={busy||bet>=maxBet} onClick={()=>adjustBet(step)} className="w-9 h-9 rounded-lg bg-white/5 disabled:opacity-30"><FaPlus className="mx-auto text-xs"/></button></div>
              </div>
              <button onClick={session ? playSpin : startSlotopolGame} disabled={busy} className="w-full md:w-auto min-w-[210px] sm:min-w-[250px] py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-primary-500 to-amber-400 text-slate-950 font-black text-lg shadow-lg disabled:opacity-50 active:scale-95 transition-transform">{busy ? 'SPINNING…' : session ? <><FaDice className="inline mr-2"/>SPIN</> : 'START GAME'}</button>
              {spinResult && gain > 0 ? <button onClick={collect} disabled={busy} className="w-full md:w-auto px-7 py-4 rounded-2xl bg-emerald-600 font-bold disabled:opacity-50">COLLECT {gain.toFixed(2)}</button> : <div className="hidden md:block w-[130px]"/>}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] sm:text-xs text-gray-500"><span>RTP {rtpDisplay(game)}%</span><span>Min {minBet}</span><span>Max {maxBet}</span><span>Slotopol GID {session?.gid || '—'}</span></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Play;
