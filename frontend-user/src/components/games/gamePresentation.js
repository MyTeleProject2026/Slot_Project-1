// Original N999Bet presentation metadata derived from Slotopol game descriptors.
// This file deliberately does not contain copied provider artwork or proprietary game skins.

export const normalizeProvider = (provider = 'Slotopol') => String(provider).trim();

export const slugifyGame = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const resolveGamePresentation = ({ provider, gameName, alias, image } = {}) => {
  const safeProvider = normalizeProvider(provider);
  const safeName = gameName || alias?.split('/').pop() || 'Slot Game';
  const providerSlug = slugifyGame(safeProvider);
  const gameSlug = slugifyGame(safeName);

  return {
    provider: safeProvider,
    gameName: safeName,
    providerSlug,
    gameSlug,
    image: image || null,
    // Stable, original CSS hooks for themed presentation packs.
    themeClass: `slot-theme-${providerSlug || 'slotopol'}`,
    assetBase: `/game-assets/${providerSlug}/${gameSlug}`,
    symbolManifest: `/game-assets/${providerSlug}/${gameSlug}/symbols.json`,
    backgroundManifest: `/game-assets/${providerSlug}/${gameSlug}/background.json`,
  };
};

export const resolveGridShape = ({ sx, sy, reels, rows, grid } = {}) => {
  const source = Array.isArray(grid) ? grid : [];
  const resolvedRows = Number(rows ?? sy) || source.length || 3;
  const resolvedReels = Number(reels ?? sx) || (Array.isArray(source[0]) ? source[0].length : 5) || 5;
  return { reels: Math.max(1, resolvedReels), rows: Math.max(1, resolvedRows) };
};
