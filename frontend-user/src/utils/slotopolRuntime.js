export function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function normalizeBalance(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function normalizeGameGrid(result) {
  if (!result) return [];
  const grid = result.grid || result.reels || result.matrix || result.symbols;
  if (!Array.isArray(grid)) return [];
  return grid;
}

export function hasWinningPositions(result) {
  const wins = result?.winningPositions || result?.wins || result?.winningLines;
  return Array.isArray(wins) ? wins.length > 0 : Boolean(wins);
}

export function getWinAmount(result) {
  const candidates = [result?.win, result?.winAmount, result?.totalWin, result?.payout, result?.payoutAmount];
  const value = candidates.find(isFiniteNumber);
  return value === undefined ? 0 : Number(value);
}

export function getFreeSpinsRemaining(result) {
  const candidates = [result?.freeSpinsRemaining, result?.freeSpins, result?.free_spin_remaining, result?.freespins];
  const value = candidates.find(v => v !== undefined && v !== null && isFiniteNumber(v));
  return value === undefined ? 0 : Math.max(0, Number(value));
}

export function getGameError(error) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Unable to communicate with the game server.';
}
