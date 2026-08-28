// Client-side guard for the player runtime. It does not generate outcomes or alter
// server results; it only prevents duplicate concurrent spin/session requests.
export function createSlotSessionGuard() {
  let busy = false;
  let requestId = 0;

  return {
    begin() {
      if (busy) return null;
      busy = true;
      requestId += 1;
      return requestId;
    },
    finish(id) {
      if (id === requestId) busy = false;
    },
    cancel(id) {
      if (id === requestId) busy = false;
    },
    isBusy() {
      return busy;
    },
    currentId() {
      return requestId;
    },
  };
}

export function isUsableServerResult(result) {
  if (!result || typeof result !== 'object') return false;
  return Boolean(
    result.grid || result.reels || result.result || result.spin ||
    result.balance !== undefined || result.win !== undefined || result.winnings !== undefined
  );
}
