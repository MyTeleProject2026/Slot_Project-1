import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCoins, FaDice, FaExpand, FaMinus, FaPlus, FaVolumeMute, FaVolumeUp, FaBolt, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useGames } from '../hooks/useGames';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SlotReelBoard from '../components/games/SlotReelBoard';
import slotAudio from '../services/slotAudio';

const unwrap = (response) => response?.data || response || {};
const errorMessage = (error, fallback) => error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;
const gameState = (data) => data?.session?.game || data?.session?.provider?.game || data?.game || data?.result?.game || data?.result || null;

function readGrid(state) {
  return state?.grid || state?.Grid || state?.screen || state?.Screen || [];
}

function toRows(grid, reels, rows) {
  if (!Array.isArray(grid) || !grid.length) return [];
  const expectedReels = Number(reels || 0);
  const expectedRows = Number(rows || 0);
  if (expectedReels > 0 && grid.length === expectedReels && Array.isArray(grid[0])) {
    const inner = Math.max(...grid.map((r) => Array.isArray(r) ? r.length : 1));
    if (!expectedRows || inner === expectedRows) {
      return Array.from({ length: inner }, (_, r) => grid.map((reel) => Array.isArray(reel) ? reel[r] : reel));
    }
  }
  if (Array.isArray(grid[0])) return grid;
  return [grid];
}

function numeric(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function gameLimits(game) {
  const raw = game?.raw || game || {};
  const min = numeric(game?.minBet ?? raw.minBet, 0.1);
  const max = numeric(game?.maxBet ?? raw.maxBet, 100);
  const lines = numeric(game?.lines ?? raw.ln ?? raw.lnum, 20);
  return { min: Math.max(0.01, min), max: Math.max(min, max), lines: Math.max(1, lines) };
}

const providerInitials = (provider) => String(provider || 'SLOTOPOL').split(/\s+/).map((p) => p[0]).join('').slice(0, 4).toUpperCase();

const Play = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { games, loading, startGame, spin, collectWin } = useGames();
  const { balance, refreshBalance } = useWallet();

  const [game, setGame] = useState(null);
  const [session, setSession] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [bet, setBet] = useState(1);
  const [lines, setLines] = useState(20);
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(true);
  const [quickSpin, setQuickSpin] = useState(false);
  const [autoSpins, setAutoSpins] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState(null);
  const autoRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t('game.loginToPlay'));
      navigate('/login');
      return;
    }
    const id = decodeURIComponent(gameId || '');
    const found = games?.find((item) => String(item.id) === id);
    if (found) {
      setGame(found);
      const limits = gameLimits(found);
      setBet((current) => Math.min(limits.max, Math.max(limits.min, current)));
      setLines(Math.min(limits.lines, 20));
    } else if (!loading && games?.length) {
      setError(t('game.unavailable'));
    }
  }, [games, gameId, loading, navigate, isAuthenticated, t]);

  const limits = useMemo(() => gameLimits(game), [game]);
  const activeState = spinResult ? gameState(spinResult) : session?.gameState;
  const rawGrid = readGrid(activeState);
  const grid = useMemo(() => toRows(rawGrid, game?.reels || game?.raw?.sx, game?.rows || game?.raw?.sy), [rawGrid, game]);
  const wins = activeState?.wins || spinResult?.wins || spinResult?.result?.wins || [];
  const gain = numeric(spinResult?.gain ?? spinResult?.game?.gain ?? spinResult?.result?.gain, 0);
  const freeSpins = numeric(spinResult?.fs ?? spinResult?.game?.fs ?? activeState?.fs, 0);
  const wallet = numeric(balance?.main, 0);
  const reelCount = numeric(game?.reels ?? game?.raw?.sx, grid?.[0]?.length || 0);
  const rowCount = numeric(game?.rows ?? game?.raw?.sy, grid?.length || 0);

  useEffect(() => {
    if (!game || session || busy || error) return;
    startSlotopolGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  useEffect(() => {
    if (!spinResult || !sound) return;
    slotAudio.unlock();
    if (freeSpins > 0) slotAudio.freeSpins();
    else if (gain > 0) slotAudio.win(gain / Math.max(bet, 0.01));
  }, [spinResult, sound, freeSpins, gain, bet]);

  useEffect(() => () => { autoRef.current = false; }, []);

  async function startSlotopolGame() {
    if (!game || busy) return;
    setBusy(true);
    setError(null);
    try {
      slotAudio.unlock();
      const response = await startGame(game.id, bet, lines);
      const data = unwrap(response);
      const localId = data.sessionId || data.session?.id;
      const gid = data.session?.gid ?? data.gid;
      if (data.success === false || !localId || gid == null) throw new Error(data.error || 'Slotopol game session could not be created');
      setSession({ localSessionId: localId, gid: numeric(gid), gameState: gameState(data) });
      await refreshBalance();
    } catch (e) {
      const message = errorMessage(e, 'Unable to start Slotopol game');
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function playSpin({ fromAuto = false } = {}) {
    if (!session || busy || (wallet > 0 && wallet < bet * Math.max(lines, 1) && freeSpins <= 0)) return false;
    setBusy(true);
    setError(null);
    try {
      slotAudio.unlock();
      if (sound) slotAudio.spinStart();
      const response = await spin(session.localSessionId, bet, lines);
      const data = unwrap(response);
      if (data.success === false) throw new Error(data.error || 'Slotopol spin failed');
      const result = data.result || data;
      setSpinResult(result);
      setSession((old) => ({ ...old, gameState: gameState(result) || old.gameState }));
      await refreshBalance();
      const resultGain = numeric(result?.gain ?? result?.game?.gain ?? result?.result?.gain, 0);
      const resultFs = numeric(result?.fs ?? result?.game?.fs ?? gameState(result)?.fs, 0);
      if (!fromAuto && resultGain > 0) toast.success(`WIN +${resultGain.toFixed(2)}`);
      if (resultFs > 0 && !fromAuto) toast.success(`${resultFs} free spins remaining`);
      return true;
    } catch (e) {
      const message = errorMessage(e, 'Slotopol spin failed');
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function collect() {
    if (!session || busy) return;
    setBusy(true);
    try {
      const response = await collectWin(session.localSessionId);
      const data = unwrap(response);
      if (data.success === false) throw new Error(data.error || 'Collect failed');
      await refreshBalance();
      setSpinResult(null);
      toast.success('Win collected');
    } catch (e) {
      toast.error(errorMessage(e, 'Collect failed'));
    } finally {
      setBusy(false);
    }
  }

  async function runAutoplay(count) {
    if (!session || busy || autoRef.current) return;
    autoRef.current = true;
    setAutoSpins(count);
    for (let i = 0; i < count && autoRef.current; i += 1) {
      setAutoSpins(count - i);
      const ok = await playSpin({ fromAuto: true });
      if (!ok) break;
      await new Promise((resolve) => setTimeout(resolve, quickSpin ? 450 : 1300));
    }
    autoRef.current = false;
    setAutoSpins(0);
  }

  const stopAutoplay = () => { autoRef.current = false; setAutoSpins(0); };
  const adjustBet = (delta) => setBet((value) => Math.min(limits.max, Math.max(limits.min, Number((value + delta).toFixed(2)))));
  const adjustLines = (delta) => setLines((value) => Math.min(limits.lines, Math.max(1, value + delta)));

  const fullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const image = game?.image || game?.image_url || '';
  const provider = game?.provider || game?.raw?.prov || 'Slotopol';
  const rtp = Array.isArray(game?.rtp) && game.rtp.length ? Number(game.rtp[game.rtp.length - 1]).toFixed(2) : 'N/A';
  const info = game?.raw || game || {};
  const canCollect = gain > 0;

  if (loading || (!game && !error)) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center text-gray-300 px-6"><div><p className="text-xl">{error}</p><button onClick={() => navigate('/games')} className="mt-5 px-6 py-3 bg-primary-500 text-dark-900 rounded-xl font-bold">{t('common.back')}</button></div></div>;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1500px] items-center justify-between gap-2 px-3 sm:px-5">
          <button onClick={() => navigate('/games')} className="flex items-center gap-2 text-slate-300 hover:text-white"><FaArrowLeft /><span className="hidden sm:inline">Games</span></button>
          <div className="min-w-0 flex items-center gap-2 sm:gap-3">
            {image ? <img src={image} alt="" className="h-8 w-8 rounded-lg object-cover border border-white/10" /> : <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-300 to-fuchsia-600 flex items-center justify-center text-[10px] font-black">{providerInitials(provider)}</div>}
            <div className="min-w-0"><div className="truncate text-sm sm:text-base font-black">{game.name}</div><div className="truncate text-[9px] uppercase tracking-[.16em] text-slate-500">{provider} · {game.id}</div></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => { setSound((v) => !v); slotAudio.unlock(); }} aria-label="Sound" className="text-slate-300 hover:text-white">{sound ? <FaVolumeUp /> : <FaVolumeMute />}</button>
            <button onClick={() => setShowInfo(true)} aria-label="Game info" className="text-slate-300 hover:text-white"><FaInfoCircle /></button>
            <button onClick={fullscreen} aria-label="Fullscreen" className="text-slate-300 hover:text-white"><FaExpand /></button>
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2"><FaCoins className="text-amber-400"/><span className="font-bold">{wallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1500px] flex-col px-2 py-3 sm:px-4 sm:py-5 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[.16em] text-slate-500">
          <span>{provider} · {game.name}</span><span>{reelCount || '—'} reels · {rowCount || '—'} rows · RTP {rtp}%</span>
        </div>

        <section className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-900 via-[#0b0f1c] to-[#05070d] p-2 sm:p-5 lg:p-8 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,.08),transparent_42%)]" />
          <div className="relative flex min-h-[54vh] items-center justify-center">
            <SlotReelBoard grid={grid} wins={wins} spinning={busy} sound={sound} reels={reelCount} rows={rowCount} />
          </div>

          <AnimatePresence>
            {busy && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="rounded-full border border-amber-300/20 bg-black/40 px-5 py-2 text-[10px] font-black uppercase tracking-[.28em] text-amber-200 backdrop-blur">{autoSpins ? `AUTO ${autoSpins}` : 'SPINNING'}</div></motion.div>}
            {gain > 0 && !busy && <motion.div initial={{ opacity: 0, y: 25, scale: .85 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute left-1/2 top-5 -translate-x-1/2 rounded-2xl border border-emerald-300/30 bg-emerald-950/75 px-6 py-3 text-center shadow-2xl backdrop-blur"><div className="text-[9px] uppercase tracking-[.25em] text-emerald-300">WIN</div><div className="text-2xl font-black text-emerald-100">+{gain.toFixed(2)}</div></motion.div>}
            {freeSpins > 0 && !busy && <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/30 bg-amber-950/80 px-5 py-2 text-xs font-black text-amber-100 shadow-xl">FREE SPINS · {freeSpins}</motion.div>}
          </AnimatePresence>
        </section>

        {error && <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <section className="mt-3 rounded-2xl border border-white/10 bg-[#0b0f18] p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr] lg:items-center">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <div className="text-center"><div className="text-[9px] uppercase tracking-[.18em] text-slate-500">Balance</div><div className="font-black">{wallet.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div></div>
              <div className="h-8 w-px bg-white/10" />
              <div className="rounded-xl border border-white/10 bg-black/20 p-1"><div className="flex items-center gap-1"><button disabled={busy || bet <= limits.min} onClick={() => adjustBet(-Math.max(limits.min < 1 ? .1 : 1, limits.min))} className="h-8 w-8 rounded-lg bg-white/5 disabled:opacity-30"><FaMinus className="mx-auto text-[10px]"/></button><div className="w-16 text-center"><div className="text-[8px] text-slate-500">BET</div><div className="font-black">{bet.toFixed(limits.min < 1 ? 2 : 0)}</div></div><button disabled={busy || bet >= limits.max} onClick={() => adjustBet(Math.max(limits.min < 1 ? .1 : 1, limits.min))} className="h-8 w-8 rounded-lg bg-white/5 disabled:opacity-30"><FaPlus className="mx-auto text-[10px]"/></button></div></div>
            </div>

            <div className="order-last col-span-2 flex items-center justify-center gap-2 lg:order-none lg:col-span-1">
              <div className="rounded-xl border border-white/10 bg-black/20 p-1"><div className="flex items-center gap-1"><button disabled={busy || lines <= 1} onClick={() => adjustLines(-1)} className="h-8 w-8 rounded-lg bg-white/5 disabled:opacity-30"><FaMinus className="mx-auto text-[10px]"/></button><div className="w-12 text-center"><div className="text-[8px] text-slate-500">LINES</div><div className="font-black">{lines}</div></div><button disabled={busy || lines >= limits.lines} onClick={() => adjustLines(1)} className="h-8 w-8 rounded-lg bg-white/5 disabled:opacity-30"><FaPlus className="mx-auto text-[10px]"/></button></div></div>
            </div>

            <div className="col-span-2 flex items-center justify-center gap-2 lg:col-span-1">
              <button onClick={() => { if (autoRef.current) stopAutoplay(); else runAutoplay(10); }} disabled={!session || busy && !autoRef.current} className="hidden sm:flex h-14 min-w-24 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-4 text-xs font-black uppercase tracking-wider text-slate-300 hover:bg-white/[.08] disabled:opacity-30"><FaBolt />{autoRef.current ? 'STOP' : 'AUTO'}</button>
              <button onClick={() => playSpin()} disabled={!session || busy || autoRef.current} className="h-16 min-w-[180px] flex-1 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 px-8 text-lg font-black text-slate-950 shadow-[0_12px_40px_rgba(245,158,11,.2)] transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"><FaDice className="mr-2 inline"/>{busy ? 'SPINNING' : 'SPIN'}</button>
            </div>

            <div className="flex items-center justify-center gap-2 lg:justify-end">
              <button onClick={() => setQuickSpin((v) => !v)} className={`rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-wider ${quickSpin ? 'border-amber-300/40 bg-amber-300/10 text-amber-200' : 'border-white/10 text-slate-500'}`}>Quick</button>
              {canCollect && <button onClick={collect} disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-40">Collect {gain.toFixed(2)}</button>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[9px] uppercase tracking-[.16em] text-slate-600"><span>Min {limits.min}</span><span>Max {limits.max}</span><span>Lines {limits.lines}</span><span>GID {session?.gid || '—'}</span>{autoSpins > 0 && <span className="text-amber-400">Auto {autoSpins}</span>}</div>
        </section>
      </main>

      <AnimatePresence>
        {showInfo && <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInfo(false)}><motion.div initial={{ y: 20, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0f18] p-5 shadow-2xl"><div className="flex items-center justify-between"><div><div className="text-xs uppercase tracking-[.2em] text-slate-500">Provider</div><h2 className="text-xl font-black">{provider}</h2></div><button onClick={() => setShowInfo(false)} className="rounded-lg bg-white/5 px-3 py-2 text-slate-400">Close</button></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-white/[.03] p-3"><div className="text-[9px] text-slate-500">Game</div><div className="font-bold">{game.name}</div></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-[9px] text-slate-500">Game ID</div><div className="font-bold break-all">{game.id}</div></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-[9px] text-slate-500">Dimensions</div><div className="font-bold">{reelCount || '—'} × {rowCount || '—'}</div></div><div className="rounded-xl bg-white/[.03] p-3"><div className="text-[9px] text-slate-500">RTP</div><div className="font-bold">{rtp}%</div></div></div><div className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[.03] p-3 text-xs text-slate-400">All spin outcomes, wins, free-spin counts and wallet changes are taken from the Slotopol server. The browser does not generate slot outcomes.</div><details className="mt-4"><summary className="cursor-pointer text-xs text-slate-500">Server metadata</summary><pre className="mt-2 max-h-52 overflow-auto rounded-xl bg-black/30 p-3 text-[9px] text-slate-500">{JSON.stringify(info, null, 2)}</pre></details></motion.div></motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default Play;
