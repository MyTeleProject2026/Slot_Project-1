import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import slotAudio from '../../services/slotAudio';

const asArray = (value) => Array.isArray(value) ? value : [];
const unwrapSymbol = (value) => value && typeof value === 'object'
  ? value.symbol ?? value.sym ?? value.id ?? value.value ?? value.code ?? value.name ?? '?'
  : value;
const symbolLabel = (value) => {
  const v = unwrapSymbol(value);
  return v === null || v === undefined ? '·' : String(v);
};
const symbolKind = (value) => {
  const text = symbolLabel(value).toLowerCase();
  if (text.includes('wild') || text === 'w') return 'wild';
  if (text.includes('scatter') || text === 's') return 'scatter';
  if (text.includes('bonus') || text === 'b') return 'bonus';
  return 'normal';
};
const symbolTheme = (value) => {
  const label = symbolLabel(value);
  const n = Number(label);
  if (Number.isFinite(n)) return `symbol-${Math.abs(n) % 8}`;
  const code = label.charCodeAt(0);
  return `symbol-${Number.isFinite(code) ? code % 8 : 0}`;
};

// Slotopol responses can be reel-major, row-major, or contain sparse/non-array values.
// Normalize everything before rendering so a malformed response can never crash React.
const normalizeGrid = (grid) => {
  const source = asArray(grid);
  if (!source.length) return null;
  const rows = source.map((row) => asArray(row));
  const width = Math.max(0, ...rows.map((row) => row.length));
  if (!width) return null;
  return {
    rows: rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? '·')),
    width,
    height: rows.length,
  };
};

const getWinningKeys = (wins) => {
  const list = asArray(wins);
  const keys = new Set();
  list.forEach((win) => {
    if (!win || typeof win !== 'object') return;
    const positions = win.positions || win.cells || win.coords || win.coordinates;
    asArray(positions).forEach((p) => {
      if (Array.isArray(p) && p.length >= 2) keys.add(`${p[0]}:${p[1]}`);
      else if (p && typeof p === 'object') keys.add(`${p.row ?? p.y ?? 0}:${p.col ?? p.x ?? 0}`);
    });
    const line = win.line ?? win.payline;
    asArray(line).forEach((row, col) => keys.add(`${row}:${col}`));
  });
  return keys.size || !list.length ? keys : null;
};

export default function SlotReelBoard({ grid, wins = [], spinning = false, sound = true, reels = 0, rows = 0, gameName = '' }) {
  const safeWins = useMemo(() => asArray(wins), [wins]);
  const normalized = useMemo(() => normalizeGrid(grid), [grid]);
  const [phase, setPhase] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!spinning) { setSettled(true); return; }
    setSettled(false);
    setPhase((p) => p + 1);
    if (sound) slotAudio.spinStart();
  }, [spinning, sound]);

  useEffect(() => {
    if (settled && safeWins.length && sound) slotAudio.win(safeWins.length * 2);
  }, [settled, safeWins, sound]);

  if (!normalized) return (
    <div className="relative w-full max-w-6xl aspect-[16/8] min-h-[280px] rounded-[32px] bg-[#070b15] border border-white/10 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,.2),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(245,158,11,.13),transparent_32%)]" />
      <div className="relative text-center text-slate-400"><div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-2xl border border-amber-300/30 bg-amber-300/10 flex items-center justify-center text-2xl">✦</div><div className="font-black tracking-wide">PREPARING GAME</div><div className="text-xs mt-2 text-slate-500">Waiting for the authoritative Slotopol game state</div></div>
    </div>
  );

  const rowCount = Math.max(1, Number(rows) || normalized.height);
  const colCount = Math.max(1, Number(reels) || normalized.width);
  const winning = getWinningKeys(safeWins);
  const cells = normalized.rows.flatMap((row, r) => row.map((value, c) => ({ value, r, c })));
  const title = gameName || 'N999BET ORIGINAL GAME';

  return (
    <div className="relative w-full max-w-6xl">
      <style>{`.slot-runtime-board{background:linear-gradient(145deg,#0a1022,#05070f 58%,#10182d);box-shadow:0 32px 100px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.08)}.slot-runtime-cell{background:linear-gradient(145deg,rgba(30,41,59,.98),rgba(2,6,23,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 8px 18px rgba(0,0,0,.22)}.symbol-0{filter:hue-rotate(0deg)}.symbol-1{filter:hue-rotate(35deg)}.symbol-2{filter:hue-rotate(75deg)}.symbol-3{filter:hue-rotate(120deg)}.symbol-4{filter:hue-rotate(170deg)}.symbol-5{filter:hue-rotate(220deg)}.symbol-6{filter:hue-rotate(270deg)}.symbol-7{filter:hue-rotate(315deg)}`}</style>
      <div className="absolute -inset-3 rounded-[40px] bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/10 to-amber-400/15 blur-2xl" />
      <div className="relative slot-runtime-board rounded-[32px] border border-white/10 p-2 sm:p-4 md:p-6 overflow-hidden">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/80 to-transparent" />
        <div className="relative mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/[.06] bg-black/20 px-3 py-2 text-[9px] uppercase tracking-[.22em] text-slate-400"><span className="truncate">{title}</span><span className="shrink-0 text-amber-200">LIVE ENGINE</span></div>
        <div className="relative grid gap-1.5 sm:gap-2 md:gap-3" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {cells.map(({ value, r, c }) => {
            const key = `${r}:${c}`;
            const isWin = winning === null || winning.has(key);
            const kind = symbolKind(value);
            return <motion.div key={`${phase}-${key}`} initial={{ y: spinning ? -180 - c * 18 : 0, opacity: spinning ? 0.2 : 1, scaleY: spinning ? 1.18 : .96 }} animate={{ y: 0, opacity: 1, scaleY: 1, scale: isWin && settled ? 1.04 : 1 }} transition={{ duration: spinning ? .38 + c * .075 : .22, delay: spinning ? c * .065 : 0, type: spinning ? 'spring' : 'tween', stiffness: 180, damping: 17 }} onAnimationComplete={() => { if (sound && spinning && r === normalized.height - 1) { slotAudio.reelStop(c); if (c === normalized.width - 1) setSettled(true); } }} className={`slot-runtime-cell relative aspect-square min-h-[58px] sm:min-h-[84px] md:min-h-[112px] rounded-2xl overflow-hidden border flex items-center justify-center select-none ${isWin && settled ? 'border-amber-300/90 shadow-[0_0_30px_rgba(251,191,36,.3)]' : 'border-white/10'} ${kind === 'wild' ? 'bg-fuchsia-950' : kind === 'scatter' ? 'bg-amber-950' : kind === 'bonus' ? 'bg-emerald-950' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,.16),transparent_42%)]" />
              <motion.div animate={isWin && settled ? { rotate: [0, 2, -2, 0] } : { rotate: 0 }} transition={{ duration: .55, repeat: isWin && settled ? Infinity : 0, repeatDelay: .8 }} className={`relative z-10 ${symbolTheme(value)} flex h-[78%] w-[78%] items-center justify-center rounded-[28%] border border-white/10 bg-gradient-to-br from-white/10 to-transparent shadow-inner`}>
                <span className={`font-black tracking-tight text-center leading-none break-all px-1 drop-shadow-[0_4px_10px_rgba(0,0,0,.65)] ${symbolLabel(value).length > 7 ? 'text-[clamp(12px,2vw,24px)]' : 'text-[clamp(22px,5vw,56px)]'} ${isWin && settled ? 'text-amber-100' : 'text-white'}`}>{symbolLabel(value)}</span>
              </motion.div>
            </motion.div>;
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[9px] sm:text-[11px] uppercase tracking-[.18em] text-slate-500"><span>{spinning ? 'Server spin in progress' : 'Authoritative server result'}</span><span>{normalized.width} × {normalized.height}</span></div>
      </div>
      <AnimatePresence>{settled && safeWins.length > 0 && <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center"><motion.div animate={{ y: [0,-8,0] }} transition={{ duration: .9, repeat: Infinity }} className="rounded-full border border-amber-200/40 bg-black/60 px-5 py-2 text-sm font-black tracking-[.18em] text-amber-100 shadow-2xl backdrop-blur">WIN!</motion.div></motion.div>}</AnimatePresence>
    </div>
  );
}
