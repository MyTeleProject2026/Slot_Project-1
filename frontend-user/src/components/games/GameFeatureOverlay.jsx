import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import slotAudio from '../../services/slotAudio';

const number = (v) => Number(v || 0);

export default function GameFeatureOverlay({ result = {}, onCollect, onDoubleUp, onContinue, busy = false }) {
  const fs = number(result.fs ?? result.freeSpins ?? result.free_spins);
  const gain = number(result.gain ?? result.win);
  const multiplier = number(result.multiplier ?? result.mult ?? result.x);
  const cascades = number(result.cascades ?? result.cascade ?? result.falls);
  const bonus = Boolean(result.bonus ?? result.bonusTriggered ?? result.feature);
  const doubleAvailable = Boolean(result.doubleUpAvailable ?? result.doubleup ?? gain > 0);

  useEffect(() => {
    if (fs > 0) slotAudio.freeSpins();
    else if (gain >= 20) slotAudio.bigWin();
    else if (gain > 0) slotAudio.win(gain);
  }, [fs, gain]);

  const canContinue = fs > 0 && typeof onContinue === 'function' && !busy;

  return <AnimatePresence>
    {(fs > 0 || bonus || multiplier > 1 || cascades > 0 || gain > 0) && <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
      <motion.div initial={{ opacity: 0, scale: .72, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }} transition={{ type: 'spring', stiffness: 210, damping: 20 }} className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[30px] border border-amber-200/30 bg-gradient-to-b from-indigo-950 via-slate-950 to-black p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,.22),transparent_46%)]" />
        <div className="relative">
          {fs > 0 && <><motion.div animate={{ rotate: [0,-5,5,0], scale: [1,1.08,1] }} transition={{ duration: .8, repeat: Infinity }} className="text-5xl">✦</motion.div><h2 className="mt-3 text-2xl font-black tracking-wide text-amber-200">FREE SPINS</h2><p className="mt-2 text-5xl font-black text-white">{fs}</p><p className="mt-2 text-xs uppercase tracking-[.25em] text-slate-400">spins remaining</p></>}
          {bonus && <><div className="text-5xl">✹</div><h2 className="mt-3 text-2xl font-black text-fuchsia-200">BONUS FEATURE</h2></>}
          {cascades > 0 && <p className="mt-3 text-sm font-black tracking-[.18em] text-cyan-200">CASCADE × {cascades}</p>}
          {multiplier > 1 && <motion.p initial={{ scale: .5 }} animate={{ scale: [1,1.2,1] }} transition={{ duration: .55 }} className="mt-3 text-4xl font-black text-emerald-300">×{multiplier}</motion.p>}
          {gain > 0 && <><p className="mt-4 text-xs uppercase tracking-[.25em] text-slate-400">current win</p><p className="mt-1 text-4xl font-black text-amber-100">{gain.toLocaleString()}</p></>}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {gain > 0 && <button disabled={busy || typeof onCollect !== 'function'} onClick={onCollect} className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy ? 'WORKING…' : 'COLLECT'}</button>}
            {gain > 0 && doubleAvailable && <button disabled={busy || typeof onDoubleUp !== 'function'} onClick={onDoubleUp} className="rounded-2xl border border-fuchsia-300/40 bg-fuchsia-500/15 px-4 py-3 text-sm font-black text-fuchsia-100 disabled:opacity-50">DOUBLE UP ×2</button>}
            {canContinue && <button onClick={onContinue} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-black text-white sm:col-span-2">CONTINUE</button>}
          </div>
        </div>
      </motion.div>
    </div>}
  </AnimatePresence>;
}
