// Original N999Bet presentation metadata derived from Slotopol game descriptors.
// This module deliberately does not contain copied provider artwork or proprietary game skins.

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
  const assetBase = `/game-assets/${providerSlug || 'slotopol'}/${gameSlug || 'slot-game'}`;

  return {
    provider: safeProvider,
    gameName: safeName,
    providerSlug,
    gameSlug,
    image: image || null,
    // Stable, original CSS hooks for N999Bet-owned presentation packs.
    themeClass: `slot-theme-${providerSlug || 'slotopol'}`,
    assetBase,
    symbolManifest: `${assetBase}/symbols.json`,
    backgroundManifest: `${assetBase}/background.json`,
  };
};

export const resolveGridShape = ({ sx, sy, reels, rows, grid } = {}) => {
  const source = Array.isArray(grid) ? grid : [];
  const nested = Array.isArray(source[0]);
  const resolvedRows = Number(rows ?? sy) || source.length || 3;
  const resolvedReels = Number(reels ?? sx) || (nested ? source[0].length : 5) || 5;
  return { reels: Math.max(1, resolvedReels), rows: Math.max(1, resolvedRows) };
};

// Normalize Slotopol's grid/screen payloads without inventing outcomes.
// The server remains authoritative; this only converts transport shape to a renderer-friendly form.
export const normalizeSlotGrid = (grid, { sx, sy, reels, rows } = {}) => {
  if (!Array.isArray(grid) || !grid.length) return [];
  const shape = resolveGridShape({ sx, sy, reels, rows, grid });

  if (!Array.isArray(grid[0])) return [grid.slice(0, shape.reels)];

  // Slotopol may return reels-first [reel][row]. Convert to rows-first [row][reel].
  if (grid.length === shape.reels && grid.some((column) => Array.isArray(column) && column.length === shape.rows)) {
    return Array.from({ length: shape.rows }, (_, rowIndex) =>
      Array.from({ length: shape.reels }, (_, reelIndex) => grid[reelIndex]?.[rowIndex] ?? null),
    );
  }

  return grid.map((row) => Array.isArray(row) ? row.slice(0, shape.reels) : [row]);
};

export const resolvePresentationContext = ({ provider, gameName, alias, image, sx, sy, reels, rows, grid } = {}) => {
  const presentation = resolveGamePresentation({ provider, gameName, alias, image });
  const normalizedGrid = normalizeSlotGrid(grid, { sx, sy, reels, rows });
  const shape = resolveGridShape({ sx, sy, reels, rows, grid: normalizedGrid });

  return {
    ...presentation,
    ...shape,
    grid: normalizedGrid,
    key: `${presentation.providerSlug}:${presentation.gameSlug}`,
  };
};
