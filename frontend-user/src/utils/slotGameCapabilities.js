const DEFAULT_OPERATIONS = Object.freeze({
  spin: true, bet: true, lines: false, autoplay: false, quickSpin: false,
  collect: false, doubleUp: false, freeSpins: false, cascade: false, multiplier: false,
});

export function normalizeSlotCapabilities(payload = {}) {
  const root = payload?.game || payload?.data?.game || payload;
  const capabilities = root?.capabilities || payload?.capabilities || {};
  const operations = capabilities.operations || root?.operations || {};
  return {
    gameType: Number(capabilities.gameType ?? root?.gt ?? 1),
    reels: Number(capabilities.reels ?? root?.sx ?? 0),
    rows: Number(capabilities.rows ?? root?.sy ?? 0),
    lines: Number(capabilities.lines ?? root?.ln ?? root?.lnum ?? 0),
    symbolCount: Number(capabilities.symbolCount ?? root?.sn ?? 0),
    rtpOptions: Array.isArray(capabilities.rtpOptions) ? capabilities.rtpOptions : [],
    serverAuthoritative: capabilities.serverAuthoritative !== false,
    operations: { ...DEFAULT_OPERATIONS, ...operations },
    renderer: capabilities.renderer || root?.renderer || { type: 'slot-reels', theme: 'n999bet-original' },
  };
}

export function canSlotOperation(capabilities, operation) {
  if (!operation) return false;
  return normalizeSlotCapabilities(capabilities).operations[operation] === true;
}

export function slotBoardShape(capabilities) {
  const c = normalizeSlotCapabilities(capabilities);
  return { reels: Math.max(0, c.reels), rows: Math.max(0, c.rows) };
}
