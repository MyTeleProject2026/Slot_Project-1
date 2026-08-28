import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import slotAudio from '../../services/slotAudio';
import { getSlotAnimationProfile } from '../../utils/slotAnimationProfile';

const unwrapSymbol = (value) => value && typeof value === 'object'
  ? value.symbol ?? value.sym ?? value.id ?? value.value ?? value.code ?? value.name ?? '?'
  : value;

const symbolLabel = (value) => {
  const v = unwrapSymbol(value);
  return v === null || v === undefined ? '·' : String(v);
};

const symbolAsset = (value) => {
  if (!value || typeof value !== 'object') return '';
  return String(value.image || value.image_url || value.icon || value.icon_url || value.sprite || value.src || value.texture || '');
};

const numericSymbol = (value) => {
  const n = Number(unwrapSymbol(value));
  return Number.isFinite(n) ? Math.abs(Math.trunc(n)) : 0;
};

const symbolKind = (value) => {
  const text = symbolLabel(value).toLowerCase();
  if (text.includes('wild') || text === 'w') return 'wild';
  if (text.includes('scatter') || text === 's') return 'scatter';
  if (text.includes('bonus') || text === 'b') return 'bonus';
  if (text.includes('free') || text.includes('fs')) return 'free';
  return 'normal';
};

const normalizeGrid = (grid) => {
  if (!Array.isArray(grid) || !grid.length) return null;
  const rows = Array.isArray(grid[0]) ? grid : [grid];
  const cleanRows = rows.map((row) => Array.isArray(row) ? row : [row]);
  const width = Math.max(0, ...cleanRows.map((row) => row.length));
  if (!width || !cleanRows.length) return null;
  return { rows: cleanRows, width, height: cleanRows.length };
};

const getWinningKeys = (wins, width, height) => {
  const keys = new Set();
  const list = Array.isArray(wins) ? wins : (wins && typeof wins === 'object' ? Object.values(wins) : []);
  list.forEach((win) => {
    if (!win || typeof win !== 'object') return;
    const positions = win.positions || win.cells || win.coords || win.coordinates || win.xy;
    if (Array.isArray(positions)) {
      const hasZero = positions.some((p) => Array.isArray(p) ? Number(p[0]) === 0 || Number(p[1]) === 0 : Number(p?.x ?? p?.col) === 0 || Number(p?.y ?? p?.row) === 0);
      positions.forEach((p) => {
        const rawX = Array.isArray(p) ? Number(p[0]) : Number(p?.x ?? p?.col ?? p?.column);
        const rawY = Array.isArray(p) ? Number(p[1]) : Number(p?.y ?? p?.row);
        if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
        const x = hasZero ? rawX : rawX - 1;
        const y = hasZero ? rawY : rawY - 1;
        if (x >= 0 && y >= 0 && x < width && y < height) keys.add(`${y}:${x}`);
      });
    }
    const line = win.line ?? win.payline;
    if (Array.isArray(line)) line.forEach((row, col) => {
      const r = Number(row);
      if (!Number.isFinite(r) || col >= width) return;
      const y = r >= 1 ? r - 1 : r;
      if (y >= 0 && y < height) keys.add(`${y}:${col}`);
    });
  });
  return keys;
};

function SymbolArt({ value, provider = '', gameName = '', spinning = false }) {
  const n = numericSymbol(value);
  const kind = symbolKind(value);
  const asset = symbolAsset(value);
  const seed = `${provider}:${gameName}:${symbolLabel(value)}`;
  const hue = (seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 17) % 360;
  const label = symbolLabel(value);
  const short = label.length > 12 ? `${label.slice(0, 11)}…` : label;
  const shapes = [
    <circle key="c" cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="7" />,
    <path key="p" d="M50 14 61 38 87 41 68 59 73 86 50 73 27 86 32 59 13 41 39 38Z" fill="currentColor" opacity=".9" />,
    <path key="d" d="M50 12 82 50 50 88 18 50Z" fill="none" stroke="currentColor" strokeWidth="7" />,
    <path key="h" d="M50 14c10 15 28 21 28 38 0 17-12 28-28 28S22 69 22 52c0-17 18-23 28-38Z" fill="currentColor" opacity=".82" />,
  ];
  return (
    <div className={`relative flex h-[80%] w-[80%] items-center justify-center overflow-hidden rounded-[24%] border border-white/15 bg-black/10 shadow-[inset_0_1px_14px_rgba(255,255,255,.08)] ${kind === 'wild' ? 'ring-2 ring-fuchsia-300/60' : ''} ${kind === 'scatter' ? 'ring-2 ring-amber-300/60' : ''} ${kind === 'bonus' ? 'ring-2 ring-emerald-300/60' : ''} ${kind === 'free' ? 'ring-2 ring-cyan-300/60' : ''}`} style={{ color: `hsl(${hue} 88% 72%)` }} title={label}>
      {asset ? (
        <img src={asset} alt={label} className={`relative z-10 h-[78%] w-[78%] object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,.65)] ${spinning ? 'blur-[1px]' : ''}`} loading="eager" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <svg viewBox="0 0 100 100" className={`absolute h-[72%] w-[72%] drop-shadow-[0_6px_12px_rgba(0,0,0,.55)] ${spinning ? 'opacity-80' : ''}`} aria-hidden="true">
          <defs><linearGradient id={`slot-symbol-${n}-${hue}-${label.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="currentColor" /><stop offset="1" stopColor="white" stopOpacity=".25" /></linearGradient></defs>
          <g fill={`url(#slot-symbol-${n}-${hue}-${label.replace(/[^a-z0-9]/gi, '')})`} stroke="currentColor">{shapes[n % shapes.length]}</g>
          <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,.35)" stroke="none" />
        </svg>
      )}
      <span className="relative z-20 max-w-[90%] truncate rounded-full bg-black/45 px-2 py-1 text-[clamp(7px,1vw,11px)] font-black uppercase tracking-[.1em] text-white/90 backdrop-blur-sm">{short}</span>
    </div>
  );
}

export default function SlotReelBoard({ grid, wins = [], spinning = false, sound = true, reels = 0, rows = 0, provider = '', gameName = '', quickSpin = false }) {
  const normalized = useMemo(() => normalizeGrid(grid), [grid]);
  const [phase, setPhase] = useState(0);
  const [settled, setSettled] = useState(false);
  const reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const animation = getSlotAnimationProfile({ quickSpin, reducedMotion });

  useEffect(() => {
    if (!spinning) { setSettled(true); return undefined; }
    setSettled(false);
    setPhase((p) => p + 1);
    return undefined;
  }, [spinning]);

  useEffect(() => {
    if (!settled || !sound) return;
    const list = Array.isArray(wins) ? wins : (wins && typeof wins === 'object' ? Object.values(wins) : []);
    if (!list.length) return;
    const amount = list.reduce((sum, w) => sum + Number(w?.pay ?? w?.win ?? w?.gain ?? 0), 0);
    slotAudio.win(amount || list.length);
  }, [settled, wins, sound]);

  if (!normalized) return (
    <div className="relative flex aspect-[16/8] min-h-[280px] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[32px] border border-white/10 bg-[#070b15]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,.2),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(245,158,11,.13),transparent 32%)]" />
      <div className="relative text-center text-slate-400"><div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-2xl">✦</div><div className="font-black tracking-wide">PREPARING GAME</div><div className="mt-2 text-xs text-slate-500">Waiting for the authoritative Slotopol game state</div></div>
    </div>
  );

  const rowCount = Number(rows) || normalized.height;
  const colCount = Number(reels) || normalized.width;
  const winning = getWinningKeys(wins, colCount, rowCount);
  const cells = [];
  normalized.rows.forEach((row, r) => row.forEach((value, c) => cells.push({ value, r, c })));
  const duration = animation.reelDuration / 1000;
  const title = gameName || 'N999BET ORIGINAL GAME';
  const list = Array.isArray(wins) ? wins : (wins && typeof wins === 'object' ? Object.values(wins) : []);
  const hasCascade = list.some((w) => Boolean(w?.cascade || w?.cascadeIndex || w?.tumble || w?.multiplier));

  return (
    <div className="relative w-full max-w-6xl">
      <style>{`.slot-runtime-board{background:linear-gradient(145deg,#0a1022,#05070f 58%,#10182d);box-shadow:0 32px 100px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.08)}.slot-runtime-cell{background:linear-gradient(145deg,rgba(30,41,59,.98),rgba(2,6,23,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 8px 18px rgba(0,0,0,.22)}@keyframes reelGlow{0%,100%{filter:brightness(.88)}50%{filter:brightness(1.22)}}@keyframes reelShimmer{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}.slot-spinning{animation:reelGlow .28s linear infinite}.slot-shimmer{animation:reelShimmer .8s ease-in-out infinite}`}</style>
      <div className="absolute -inset-3 rounded-[40px] bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/10 to-amber-400/15 blur-2xl" />
      <div className="relative slot-runtime-board overflow-hidden rounded-[32px] border border-white/10 p-2 sm:p-4 md:p-6">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
        <div className="relative mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/[.06] bg-black/20 px-3 py-2 text-[9px] uppercase tracking-[.22em] text-slate-400"><span className="truncate">{provider ? `${provider} · ` : ''}{title}</span><span className="shrink-0 text-amber-200">{spinning ? 'SERVER SPIN' : 'SERVER RESULT'}</span></div>
        <div className={`relative grid gap-1.5 sm:gap-2 md:gap-3 ${spinning ? 'slot-spinning' : ''}`} style={{ gridTemplateColumns: `repeat(${Math.max(1, colCount)}, minmax(0, 1fr))` }}>
          {cells.map(({ value, r, c }) => {
            const key = `${r}:${c}`;
            const isWin = winning.has(key);
            const kind = symbolKind(value);
            return (
              <motion.div key={`${phase}-${key}`} initial={{ y: spinning ? -300 - c * 55 : 0, opacity: spinning ? 0.08 : 1, scaleY: spinning ? 1.45 : 1 }} animate={{ y: 0, opacity: 1, scaleY: 1, scale: isWin && settled ? 1.045 : 1 }} transition={{ duration, delay: spinning ? c * (animation.stagger / 1000) : 0, ease: [0.16, 1, 0.3, 1] }} onAnimationComplete={() => { if (sound && spinning && r === rowCount - 1) { slotAudio.reelStop(c); if (c === colCount - 1) setSettled(true); } }} className={`slot-runtime-cell relative flex aspect-square min-h-[58px] items-center justify-center overflow-hidden rounded-2xl border select-none sm:min-h-[84px] md:min-h-[112px] ${isWin && settled ? 'border-amber-300/90 shadow-[0_0_35px_rgba(251,191,36,.4)]' : 'border-white/10'} ${kind === 'wild' ? 'bg-fuchsia-950/80' : kind === 'scatter' ? 'bg-amber-950/80' : kind === 'bonus' ? 'bg-emerald-950/80' : kind === 'free' ? 'bg-cyan-950/80' : ''}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,.16),transparent_42%)]" />
                {spinning && !reducedMotion && <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent slot-shimmer" />}
                <SymbolArt value={value} provider={provider} gameName={gameName} spinning={spinning} />
                {isWin && settled && <motion.span initial={{ opacity: 0, scale: .7 }} animate={{ opacity: [0, 1, .2], scale: [.75, 1.12, 1.35] }} transition={{ duration: animation.winPulse / 1000, repeat: Infinity, repeatDelay: .35 }} className="pointer-events-none absolute inset-1 rounded-2xl border-2 border-amber-300" />}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[.18em] text-slate-500 sm:text-[11px]"><span>{spinning ? 'Authoritative Slotopol result pending' : 'Authoritative Slotopol result'}</span><span>{colCount} × {rowCount}{hasCascade ? ' · cascade' : ''}</span></div>
      </div>
      <AnimatePresence>{settled && list.length > 0 && <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center"><motion.div animate={{ y: [0, -8, 0], boxShadow: ['0 0 0 rgba(251,191,36,0)', '0 0 32px rgba(251,191,36,.25)', '0 0 0 rgba(251,191,36,0)'] }} transition={{ duration: .9, repeat: Infinity }} className="rounded-full border border-amber-200/40 bg-black/60 px-5 py-2 text-sm font-black tracking-[.18em] text-amber-100 shadow-2xl backdrop-blur">WIN!</motion.div></motion.div>}</AnimatePresence>
    </div>
  );
}
