const GameSession = require('../models/GameSession');
const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');
const pool = require('../config/database'); // For raw SQL queries

// ============================================================
// HELPER: Extract game info from Slotopol response
// ============================================================
function extractGameInfo(game) {
  const aliases = game.aliases || [];
  const alias = aliases.length > 0 ? aliases[0] : null;
  return {
    id: alias ? `${alias.prov}/${alias.name}` : game.ID || 'unknown',
    name: alias ? alias.name : 'Unknown Game',
    provider: alias ? alias.prov : 'unknown',
    raw: game
  };
}

function getGameCategory(provider) {
  const map = {
    'agt': 'slots', 'aristocrat': 'slots', 'betsoft': 'slots',
    'ct interactive': 'slots', 'igt': 'slots', 'megajack': 'slots',
    'netent': 'slots', 'novomatic': 'slots', 'playngo': 'slots',
    'playtech': 'slots', 'slotopol': 'slots'
  };
  return map[provider.toLowerCase()] || 'slots';
}

// ============================================================
// PUBLIC ENDPOINTS (Keep as is)
// ============================================================

exports.getAllGames = async (req, res) => {
  try {
    const { provider, category, search, hot, new: isNew } = req.query;
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) games = games.list || games.data || [];

    const extracted = games.map(game => {
      const info = extractGameInfo(game);
      return {
        id: info.id,
        name: info.name,
        provider: info.provider,
        image: '',
        isActive: true,
        minBet: 0.1,
        maxBet: 100,
        rtpOverride: null,
        difficulty: 'medium',
        order: 0,
        tags: [],
        category: getGameCategory(info.provider),
        rtp: game.rtp || [],
        aliases: game.aliases || [],
      };
    });

    const metadata = await GameMetadata.find();
    const metaMap = {};
    metadata.forEach(m => metaMap[m.gameId] = m);

    const enriched = extracted.map(game => {
      const meta = metaMap[game.id] || {};
      return {
        ...game,
        isActive: meta.isActive !== false,
        minBet: meta.minBet || 0.1,
        maxBet: meta.maxBet || 100,
        rtpOverride: meta.rtpOverride || null,
        difficulty: meta.difficulty || 'medium',
        order: meta.order || 0,
        tags: meta.tags || [],
      };
    });

    let filtered = enriched;
    if (provider) {
      const p = provider.toLowerCase();
      filtered = filtered.filter(g => g.provider.toLowerCase() === p);
    }
    if (category && category !== 'all' && category !== 'undefined') {
      filtered = filtered.filter(g => g.category === category);
    }
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(s));
    }
    if (hot === 'true') filtered = filtered.slice(0, 50);
    if (isNew === 'true') filtered = filtered.slice(0, 50);

    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, games: filtered });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch games' });
  }
};

exports.getAllProviders = async (req, res) => {
  // ... Keep your existing code here ...
  try {
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) games = games.list || games.data || [];
    const providerMap = {};
    games.forEach(game => {
      (game.aliases || []).forEach(alias => {
        const prov = alias.prov || 'unknown';
        if (!providerMap[prov]) providerMap[prov] = 0;
        providerMap[prov]++;
      });
    });
    const providers = Object.keys(providerMap).map(name => ({
      name,
      game_count: providerMap[name],
      actual_game_count: providerMap[name],
    }));
    providers.sort((a, b) => b.game_count - a.game_count);
    res.json({ success: true, providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch providers' });
  }
};

exports.getGameById = async (req, res) => {
  // ... Keep your existing code here ...
  try {
    const gameId = req.params.id;
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) games = games.list || games.data || [];
    let found = null;
    for (const game of games) {
      const aliases = game.aliases || [];
      for (const alias of aliases) {
        if (`${alias.prov}/${alias.name}` === gameId) {
          found = { ...game, alias };
          break;
        }
      }
      if (found) break;
    }
    if (!found) return res.status(404).json({ success: false, error: 'Game not found' });
    const meta = await GameMetadata.findOne({ gameId });
    res.json({
      success: true,
      game: {
        id: gameId,
        name: found.alias.name,
        provider: found.alias.prov,
        rtp: found.rtp || [],
        isActive: meta?.isActive !== false,
        minBet: meta?.minBet || 0.1,
        maxBet: meta?.maxBet || 100,
        rtpOverride: meta?.rtpOverride || null,
        difficulty: meta?.difficulty || 'medium',
      }
    });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch game' });
  }
};

// ============================================================
// GAME SESSION ENDPOINTS (UPDATED to use real Slotopol UID)
// ============================================================

exports.startGame = async (req, res) => {
  try {
    const { gameId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const parts = gameId.split('/');
    if (parts.length < 2) return res.status(400).json({ success: false, error: 'Invalid game ID' });
    const provider = parts[0];
    const game = parts.slice(1).join('/');

    // --- NEW: Fetch the user's Slotopol UID ---
    const [rows] = await pool.query('SELECT slotopol_uid FROM users WHERE id = ?', [userId]);
    if (!rows.length || !rows[0].slotopol_uid) {
      return res.status(400).json({ success: false, error: 'User not linked to Slotopol. Please contact support.' });
    }
    const slotopolUid = rows[0].slotopol_uid;
    // -----------------------------------------

    const sessionData = await slotopolService.startGame(slotopolUid, provider, game, betAmount || 1, selectedLines || 20);
    const sessionId = await GameSession.create({
      userId,
      slotopolGameId: sessionData.gid,
      gameAlias: `${provider}/${game}`,
      providerName: provider,
      gameName: game,
      betAmount: betAmount || 1,
      selectedLines: selectedLines || 20,
      state: sessionData
    });

    res.json({ success: true, sessionId, session: sessionData, wallet: sessionData.wallet || 0 });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to start game' });
  }
};

exports.spin = async (req, res) => {
  try {
    const { sessionId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== userId) return res.status(404).json({ success: false, error: 'Session not found' });

    const spinResult = await slotopolService.spin(
      session.slotopol_game_id,
      betAmount || session.bet_amount,
      selectedLines || session.selected_lines
    );
    await GameSession.updateState(sessionId, spinResult);

    res.json({ success: true, result: spinResult, wallet: spinResult.wallet || 0 });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ success: false, error: error.message || 'Spin failed' });
  }
};

exports.collectWin = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== userId) return res.status(404).json({ success: false, error: 'Session not found' });

    const result = await slotopolService.collect(session.slotopol_game_id);
    await GameSession.updateState(sessionId, result);

    res.json({ success: true, wallet: result.wallet || 0 });
  } catch (error) {
    console.error('Collect win error:', error);
    res.status(500).json({ success: false, error: error.message || 'Collect failed' });
  }
};
