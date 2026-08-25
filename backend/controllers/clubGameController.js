const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');

function getGameCategory() { return 'slots'; }

function gameIdentity(game) {
  const alias = Array.isArray(game?.aliases) && game.aliases.length ? game.aliases[0] : null;
  const provider = alias?.prov || game?.prov || game?.provider || '';
  const id = game?.game_id || game?.id || (provider && (alias?.name || game?.name) ? `${provider}/${alias?.name || game?.name}` : '');
  const name = alias?.name || game?.name || String(id).split('/').pop() || '';
  return { id: String(id), provider: String(provider), name: String(name) };
}

function extract(game, meta) {
  const { id, provider, name } = gameIdentity(game);
  if (!id || !provider || !name) return null;
  const enabled = game?.enabled !== false && game?.active !== false && game?.status !== 'disabled' && meta?.isActive !== false;
  const reels = Number(game?.sx ?? game?.reels ?? 0);
  const rows = Number(game?.sy ?? game?.rows ?? 0);
  const lines = Number(game?.ln ?? game?.lnum ?? game?.lines ?? 0);
  const symbols = Number(game?.sn ?? game?.symbolCount ?? 0);
  const gameType = Number(game?.gt ?? game?.gameType ?? 1);
  const rtp = Array.isArray(game?.rtp) ? game.rtp : (game?.rtp != null ? [game.rtp] : []);

  return {
    id,
    name,
    provider,
    image: game?.image || game?.icon || '',
    enabled,
    isActive: enabled,
    status: enabled ? 'active' : 'disabled',
    minBet: meta?.minBet ?? game?.minBet ?? 0.1,
    maxBet: meta?.maxBet ?? game?.maxBet ?? 100,
    rtpOverride: meta?.rtpOverride ?? null,
    difficulty: meta?.difficulty ?? 'medium',
    order: meta?.order ?? 0,
    tags: meta?.tags || [],
    category: getGameCategory(provider),
    rtp,
    aliases: Array.isArray(game?.aliases) ? game.aliases : [],
    gameType,
    reels,
    rows,
    lines,
    symbolCount: symbols,
    capabilities: {
      gameType,
      reels,
      rows,
      lines,
      symbolCount: symbols,
      rtpOptions: rtp,
      serverAuthoritative: true,
      operations: { createSession:true, spin:true, bet:true, collect:true, doubleUp:true, selection:true, mode:true },
      renderer: { dynamicGrid: reels > 0 && rows > 0, provider, gameId: id },
    },
  };
}

exports.getAvailableGames = async (req, res) => {
  try {
    const clubId = Number(req.user?.club_id || process.env.N999BET_DEFAULT_CLUB_ID || 1);
    if (!Number.isInteger(clubId) || clubId <= 0) return res.status(400).json({ success:false,error:'Invalid N999Bet club configuration' });
    const games = await slotopolService.getGameList(clubId);
    const metadata = await GameMetadata.find();
    const metaMap = Object.fromEntries(metadata.map(m => [String(m.gameId), m]));
    const result = games.map(game => { const key = gameIdentity(game).id; return extract(game, metaMap[key]); }).filter(Boolean);
    const { provider, category, search, hot, new: isNew } = req.query;
    let filtered = result;
    if (provider) filtered = filtered.filter(g => g.provider.toLowerCase() === String(provider).toLowerCase());
    if (category && category !== 'all' && category !== 'undefined') filtered = filtered.filter(g => g.category === String(category).toLowerCase());
    if (search) { const q=String(search).trim().toLowerCase(); filtered=filtered.filter(g=>g.name.toLowerCase().includes(q)||g.id.toLowerCase().includes(q)); }
    if (hot === 'true' || isNew === 'true') filtered=filtered.slice(0,50);
    filtered.sort((a,b)=>(a.order||0)-(b.order||0));
    return res.json({ success:true,clubId,count:filtered.length,games:filtered });
  } catch (error) {
    console.error('Available games error:', error.response?.data || error.message);
    return res.status(error.status || 502).json({ success:false,error:error.message || 'Failed to fetch available games',code:error.code || 'GAME_CATALOG_UNAVAILABLE' });
  }
};
