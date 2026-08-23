const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');

function getGameCategory(provider = '') {
  const slots = new Set(['agt','aristocrat','betsoft','ct interactive','igt','megajack','netent','novomatic','playngo','playtech','slotopol']);
  return slots.has(String(provider).toLowerCase()) ? 'slots' : 'slots';
}

function extract(game, meta) {
  const alias = Array.isArray(game.aliases) && game.aliases.length ? game.aliases[0] : null;
  if (!alias) return null;
  const id = `${alias.prov}/${alias.name}`;
  return {
    id,
    name: alias.name,
    provider: alias.prov,
    image: '',
    isActive: meta?.isActive !== false,
    minBet: meta?.minBet ?? 0.1,
    maxBet: meta?.maxBet ?? 100,
    rtpOverride: meta?.rtpOverride ?? null,
    difficulty: meta?.difficulty ?? 'medium',
    order: meta?.order ?? 0,
    tags: meta?.tags || [],
    category: getGameCategory(alias.prov),
    rtp: game.rtp || [],
    aliases: game.aliases || [],
  };
}

exports.getAvailableGames = async (req, res) => {
  try {
    const clubId = Number(req.user?.club_id || process.env.N999BET_DEFAULT_CLUB_ID || 1);
    if (!Number.isInteger(clubId) || clubId <= 0) return res.status(400).json({ success: false, error: 'Invalid N999Bet club configuration' });

    const games = await slotopolService.getGameList(clubId);
    const metadata = await GameMetadata.find();
    const metaMap = Object.fromEntries(metadata.map(m => [m.gameId, m]));
    const result = games.map(game => extract(game, metaMap[`${game.aliases?.[0]?.prov}/${game.aliases?.[0]?.name}`])).filter(Boolean);

    const { provider, category, search, hot, new: isNew } = req.query;
    let filtered = result;
    if (provider) filtered = filtered.filter(g => g.provider.toLowerCase() === String(provider).toLowerCase());
    if (category && category !== 'all' && category !== 'undefined') filtered = filtered.filter(g => g.category === category);
    if (search) {
      const q = String(search).trim().toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(q));
    }
    if (hot === 'true' || isNew === 'true') filtered = filtered.slice(0, 50);
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, clubId, games: filtered });
  } catch (error) {
    console.error('Available games error:', error);
    res.status(error.status || 502).json({ success: false, error: error.message || 'Failed to fetch available games', code: error.code || 'GAME_CATALOG_UNAVAILABLE' });
  }
};
