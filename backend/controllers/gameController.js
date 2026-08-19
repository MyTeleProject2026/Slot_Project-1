const GameSession = require('../models/GameSession');
const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');

// ============================================================
// HELPER: Extract first alias from Slotopol game
// ============================================================
function extractGameInfo(game) {
  // Slotopol returns { aliases: [{prov, name, lnum, date}], gt, gp, sx, sy, sn, ln, rtp }
  const alias = game.aliases && game.aliases.length > 0 ? game.aliases[0] : null;
  return {
    id: alias ? `${alias.prov}/${alias.name}` : game.ID || 'unknown',
    name: alias ? alias.name : 'Unknown Game',
    provider: alias ? alias.prov : 'unknown',
    raw: game
  };
}

// ============================================================
// CATEGORY MAPPING (based on provider or tags)
// ============================================================
function getGameCategory(game) {
  const provider = game.provider.toLowerCase();
  // Map providers to categories
  const categoryMap = {
    'agt': 'slots',
    'aristocrat': 'slots',
    'betsoft': 'slots',
    'ct interactive': 'slots',
    'igt': 'slots',
    'megajack': 'slots',
    'netent': 'slots',
    'novomatic': 'slots',
    'playngo': 'slots',
    'playtech': 'slots',
    'slotopol': 'slots'
  };
  return categoryMap[provider] || 'slots';
}

// ============================================================
// PUBLIC GAME ENDPOINTS
// ============================================================

exports.getAllGames = async (req, res) => {
  try {
    const { provider, category, search, hot, new: isNew } = req.query;

    // 1. Fetch all games from Slotopol
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) {
      games = games.list || games.data || [];
    }

    // 2. Extract game info from aliases
    const extractedGames = games.map(game => {
      const info = extractGameInfo(game);
      return {
        id: info.id,
        name: info.name,
        provider: info.provider,
        image: '', // Slotopol doesn't provide images
        isActive: true,
        minBet: 0.1,
        maxBet: 100,
        rtpOverride: null,
        difficulty: 'medium',
        order: 0,
        tags: [],
        // Store raw for later use
        rtp: game.rtp || [],
        aliases: game.aliases || [],
        // Category mapping
        category: getGameCategory(info)
      };
    });

    // 3. Fetch local metadata and merge
    const metadata = await GameMetadata.find();
    const metaMap = {};
    metadata.forEach(m => metaMap[m.gameId] = m);

    const enriched = extractedGames.map(game => {
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

    // 4. Apply filters
    let filtered = enriched;

    // Filter by provider
    if (provider) {
      const p = provider.toLowerCase();
      filtered = filtered.filter(g => g.provider.toLowerCase() === p);
    }

    // Filter by category
    if (category && category !== 'all' && category !== 'undefined') {
      filtered = filtered.filter(g => g.category === category);
    }

    // Search by name
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(s));
    }

    // Hot games - return first 50
    if (hot === 'true') {
      filtered = filtered.slice(0, 50);
    }

    // New games - return first 50
    if (isNew === 'true') {
      filtered = filtered.slice(0, 50);
    }

    // Sort by order
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, games: filtered });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch games' });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) {
      games = games.list || games.data || [];
    }

    const providerMap = {};
    games.forEach(game => {
      const aliases = game.aliases || [];
      aliases.forEach(alias => {
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
  try {
    const gameId = req.params.id;

    // Fetch from Slotopol
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) {
      games = games.list || games.data || [];
    }

    // Find the game by matching ID
    let foundGame = null;
    let foundAlias = null;
    for (const game of games) {
      const aliases = game.aliases || [];
      for (const alias of aliases) {
        const fullId = `${alias.prov}/${alias.name}`;
        if (fullId === gameId) {
          foundGame = game;
          foundAlias = alias;
          break;
        }
      }
      if (foundGame) break;
    }

    if (!foundGame || !foundAlias) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    // Fetch metadata
    const meta = await GameMetadata.findOne({ gameId });

    const game = {
      id: gameId,
      name: foundAlias.name,
      provider: foundAlias.prov,
      rtp: foundGame.rtp || [],
      isActive: meta?.isActive !== false,
      minBet: meta?.minBet || 0.1,
      maxBet: meta?.maxBet || 100,
      rtpOverride: meta?.rtpOverride || null,
      difficulty: meta?.difficulty || 'medium',
    };

    res.json({ success: true, game });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch game' });
  }
};

// ============================================================
// GAME SESSION ENDPOINTS
// ============================================================

exports.startGame = async (req, res) => {
  try {
    const { gameId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const parts = gameId.split('/');
    if (parts.length < 2) {
      return res.status(400).json({ success: false, error: 'Invalid game ID format' });
    }
    const provider = parts[0];
    const game = parts.slice(1).join('/');

    const sessionData = await slotopolService.startGame(
      userId,
      provider,
      game,
      betAmount || 1,
      selectedLines || 20
    );

    const sessionId = await GameSession.create({
      userId: userId,
      slotopolGameId: sessionData.gid,
      gameAlias: `${provider}/${game}`,
      providerName: provider,
      gameName: game,
      betAmount: betAmount || 1,
      selectedLines: selectedLines || 20,
      state: sessionData
    });

    res.json({
      success: true,
      sessionId: sessionId,
      session: sessionData,
      wallet: sessionData.wallet || 0
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to start game' });
  }
};

exports.spin = async (req, res) => {
  try {
    const { sessionId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const spinResult = await slotopolService.spin(
      session.slotopol_game_id,
      betAmount || session.bet_amount,
      selectedLines || session.selected_lines
    );

    await GameSession.updateState(sessionId, spinResult);

    res.json({
      success: true,
      result: spinResult,
      wallet: spinResult.wallet || 0
    });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ success: false, error: error.message || 'Spin failed' });
  }
};

exports.collectWin = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const result = await slotopolService.collect(session.slotopol_game_id);

    await GameSession.updateState(sessionId, result);

    res.json({
      success: true,
      wallet: result.wallet || 0
    });
  } catch (error) {
    console.error('Collect win error:', error);
    res.status(500).json({ success: false, error: error.message || 'Collect failed' });
  }
};
