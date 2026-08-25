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

function normalizeGrid(input) {
  const grid = Array.isArray(input)
    ? input
    : input?.grid || input?.Grid || input?.screen || input?.Screen || input?.cells || [];
  if (!Array.isArray(grid) || grid.length === 0) return null;
  const rows = Array.isArray(grid[0]) ? grid.map((row) => asArray(row)) : [grid];
  const width = Math.max(0, ...rows.map((row) => row.length));
  return width > 0 ? { rows, width, height: rows.length } : null;
}

function getWinningKeys(rawWins) {
  const wins = asArray(rawWins);
  const keys = new Set();
  wins.forEach((win) => {
    if (!win || typeof win !== 'object') return;
    const positions = asArray(win.positions || win.cells || win.coords || win.coordinates);
    positions.forEach((p) => {
      if (Array.isArray(p) && p.length >= 2) keys.add(`${p[0]}:${p[1]}`);
      else if (p && typeof p === 'object') keys.add(`${p.row ?? p.y ?? 0}:${p.col ?? p.x ?? 0}`);
    });
    const line = win.line ?? win.payline;
    if (Array.isArray(line)) line.forEach((row, col) => keys.add(`${row}:${col}`));
  });
  return keys.size || wins.length === 0 ? keys : null;
}

export default function SlotReelBoard({ grid, wins, spinning = false, sound = true, reels = 0, rows = 0, gameName = '' }) {
  const normalized = useMemo(() => normalizeGrid(grid), [grid]);
  const safeWins = useMemo(() => asArray(wins), [wins]);
  const [phase, setPhase] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!spinning) { setSettled(true); return; }
    setSettled(false);
    setPhase((p) => p + 1);
    if (sound) slotAudio.spinStart?.();
  }, [spinning, sound]);

  useEffect(() => {
    if (settled && safeWins.length && sound) slotAudio.win?.(safeWins.length * 2);
  }, [settled, safeWins, sound]);

  if (!normalized) return <div className="relative w-full max-w-6xl aspect-[16/8] min-h-[280px] rounded-[32px] bg-[#070b15] border border-white/10 flex items-center justify-center overflow-hidden"><div className="relative text-center text-slate-400"><div className="font-black tracking-wide">PREPARING GAME</div><div className="text-xs mt-2 text-slate-500">Waiting for Slotopol game state</div></div></div>;

  const rowCount = Number(rows) > 0 ? Number(rows) : normalized.height;
  const colCount = Number(reels) > 0 ? Number(reels) : normalized.width;
  const winning = getWinningKeys(safeWins);
  const cells = [];
  normalized.rows.forEach((row, r) => row.forEach((value, c) => cells.push({ value, r, c })));

  return <div className="relative w-full max-w-6xl">
    <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-[#070b15] to-[#111827] p-2 sm:p-4 md:p-6 overflow-hidden shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/[.06] bg-black/20 px-3 py-2 text-[9px] uppercase tracking-[.22em] text-slate-400"><span className="truncate">{gameName || 'N999BET GAME'}</span><span className="shrink-0 text-amber-200">LIVE ENGINE</span></div>
      <div className="grid gap-1.5 sm:gap-2 md:gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, colCount)}, minmax(0, 1fr))` }}>
        {cells.map(({ value, r, c }) => {
          const key = `${r}:${c}`;
          const isWin = winning === null || winning.has(key);
          const kind = symbolKind(value);
          return <motion.div key={`${phase}-${key}`} initial={{ y: spinning ? -180 - c * 18 : 0, opacity: spinning ? 0.2 : 1 }} animate={{ y: 0, opacity: 1, scale: isWin && settled ? 1.04 : 1 }} transition={{ duration: spinning ? .4 + c * .07 : .2, delay: spinning ? c * .05 : 0 }} onAnimationComplete={() => { if (spinning && r === rowCount - 1 && c === Math.min(colCount - 1, normalized.width - 1)) setSettled(true); }} className={`relative aspect-square min-h-[58px] sm:min-h-[84px] rounded-2xl overflow-hidden border flex items-center justify-center ${isWin && settled ? 'border-amber-300 shadow-[0_0_30px_rgba(251,191,36,.3)]' : 'border-white/10'} ${kind === 'wild' ? 'bg-fuchsia-950' : kind === 'scatter' ? 'bg-amber-950' : kind === 'bonus' ? 'bg-emerald-950' : 'bg-slate-900'}`}>
            <span className={`font-black text-center leading-none break-all px-1 ${String(symbolLabel(value)).length > 7 ? 'text-[clamp(12px,2vw,24px)]' : 'text-[clamp(22px,5vw,56px)]'} ${isWin && settled ? 'text-amber-100' : 'text-white'}`}>{symbolLabel(value)}</span>
          </motion.div>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[.18em] text-slate-500"><span>{spinning ? 'Server spin in progress' : 'Authoritative server result'}</span><span>{colCount} × {rowCount}</span></div>
    </div>
    <AnimatePresence>{settled && safeWins.length > 0 && <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="rounded-full border border-amber-200/40 bg-black/60 px-5 py-2 text-sm font-black tracking-[.18em] text-amber-100">WIN!</div></motion.div>}</AnimatePresence>
  </div>;
}
