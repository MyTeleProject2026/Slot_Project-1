export function normalizeSlotResult(result = {}) {
  const data = result?.data ?? result;
  const grid = data?.grid ?? data?.reels ?? data?.result?.grid ?? data?.result?.reels ?? null;
  const wins = data?.wins ?? data?.winningPositions ?? data?.result?.wins ?? [];
  const winAmount = Number(data?.winAmount ?? data?.win ?? data?.result?.winAmount ?? 0);
  const freeSpins = Number(data?.freeSpins ?? data?.freeSpinsRemaining ?? data?.result?.freeSpins ?? 0);
  const jackpot = data?.jackpot ?? data?.jackpotWin ?? data?.result?.jackpot ?? null;
  return {
    raw: result,
    grid,
    wins: Array.isArray(wins) ? wins : [],
    winAmount: Number.isFinite(winAmount) ? winAmount : 0,
    freeSpins: Number.isFinite(freeSpins) ? Math.max(0, freeSpins) : 0,
    jackpot,
  };
}

export function hasWinningResult(result) {
  const normalized = normalizeSlotResult(result);
  return normalized.winAmount > 0 || normalized.wins.length > 0 || Boolean(normalized.jackpot);
}

export function getResultSoundEvents(result) {
  const normalized = normalizeSlotResult(result);
  const events = [];
  if (normalized.jackpot) events.push('jackpot');
  else if (normalized.winAmount > 0) events.push('win');
  if (normalized.freeSpins > 0) events.push('free-spin');
  return events;
}
