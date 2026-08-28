const finiteNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export function unwrapApiPayload(payload) {
  return payload?.data ?? payload ?? {};
}

export function readSessionId(payload) {
  const data = unwrapApiPayload(payload);
  return data.sessionId ?? data.session?.id ?? data.session?.sessionId ?? null;
}

export function readGameId(payload) {
  const data = unwrapApiPayload(payload);
  return data.session?.gid ?? data.gid ?? data.game?.gid ?? data.game?.id ?? null;
}

export function readGameState(payload) {
  const data = unwrapApiPayload(payload);
  return data.session?.gameState ?? data.session?.game ?? data.gameState ?? data.game ?? data.result?.game ?? data.result ?? null;
}

export function readGrid(payload) {
  const state = readGameState(payload);
  return state?.grid ?? state?.Grid ?? state?.screen ?? state?.Screen ?? [];
}

export function readWinAmount(payload) {
  const data = unwrapApiPayload(payload);
  return Math.max(0, finiteNumber(
    data.gain ?? data.win ?? data.winAmount ?? data.game?.gain ?? data.result?.gain,
    0,
  ));
}

export function readFreeSpins(payload) {
  const data = unwrapApiPayload(payload);
  const state = readGameState(data);
  return Math.max(0, Math.trunc(finiteNumber(
    data.fs ?? data.freeSpins ?? data.game?.fs ?? state?.fs ?? state?.freeSpins,
    0,
  )));
}

export function hasUsableGrid(grid) {
  return Array.isArray(grid) && grid.length > 0 && Array.isArray(grid[0]) && grid[0].length > 0;
}

export function makeSpinRequestLock() {
  let locked = false;
  return {
    get active() { return locked; },
    tryAcquire() {
      if (locked) return false;
      locked = true;
      return true;
    },
    release() { locked = false; },
  };
}

export function describeRuntimeError(error, fallback = 'The game service is temporarily unavailable.') {
  return error?.response?.data?.error
    || error?.response?.data?.message
    || error?.message
    || fallback;
}
