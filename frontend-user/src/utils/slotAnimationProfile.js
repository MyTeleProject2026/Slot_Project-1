const PROFILES = Object.freeze({
  standard: Object.freeze({ reelDuration: 680, stagger: 110, winPulse: 900 }),
  quick: Object.freeze({ reelDuration: 180, stagger: 25, winPulse: 520 }),
  reducedMotion: Object.freeze({ reelDuration: 1, stagger: 0, winPulse: 1 }),
});

export function getSlotAnimationProfile({ quickSpin = false, reducedMotion = false } = {}) {
  if (reducedMotion) return PROFILES.reducedMotion;
  return quickSpin ? PROFILES.quick : PROFILES.standard;
}

export function clampAnimationDuration(value, min = 1, max = 1200) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
