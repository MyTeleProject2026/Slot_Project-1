const GameSession = require('../models/GameSession');
const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');

// ============================================================
// PUBLIC GAME ENDPOINTS – Fetch from Slotopol
// ============================================================

exports.getAllGames = async (req, res) => {
  try {
    const { provider, category, search, hot, new: isNew } = req.query;

    // 1. Fetch all games from Slotopol (/game/algs returns array of AlgDescr)
    let games = await slotopolService.getGameList();
    // Handle different response formats
    if (!Array.isArray(games)) {
      games = games.list || games.data || [];
    }

    // 2. Fetch local metadata for all games
    const metadata = await GameMetadata.find();
    const metaMap = {};
    metadata.forEach(m => metaMap[m.gameId] = m);

    // 3. Enrich each game with metadata
    const enriched = games.map(game => {
      const meta = metaMap[game.ID] || {};
      return {
        id: game.ID,
        name: game.Name || game.name || 'Unknown Game',
        provider: game.Prov || game.provider || 'unknown',
        image: game.Image || game.image || '',
        isActive: meta.isActive !== false,
        minBet: meta.minBet || 0.1,
        maxBet: meta.maxBet || 100,
        rtpOverride: meta.rtpOverride || null,
        difficulty: meta.difficulty || 'medium',
        order: meta.order || 0,
        tags: meta.tags || [],
        // Keep original fields for flexibility
        ...game,
      };
    });

    // 4. Apply filters
    let filtered = enriched;

    // Filter by provider
    if (provider) {
      const p = provider.toLowerCase();
      filtered = filtered.filter(g => g.provider.toLowerCase() === p);
    }

    // Filter by category (if we have a mapping – for now, just pass through)
    // You can expand this later by storing category in metadata tags
    if (category && category !== 'all') {
      // If you store category in tags, filter here
      filtered = filtered.filter(g => g.tags && g.tags.includes(category));
    }

    // Search by name
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(s));
    }

    // Hot games – no direct equivalent; could be based on play count
    if (hot === 'true') {
      // For now, return first 50
      filtered = filtered.slice(0, 50);
    }

    // New games – no direct equivalent; could be based on release date
    if (isNew === 'true') {
      // For now, return first 50
      filtered = filtered.slice(0, 50);
    }

    // Sort by order if available
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, games: filtered });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch games' });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    // Fetch all games from Slotopol
    let games = await slotopolService.getGameList();
    if (!Array.isArray(games)) {
      games = games.list || games.data || [];
    }

    const providerMap = {};
    games.forEach(game => {
      const prov = game.Prov || game.provider || 'unknown';
      if (!providerMap[prov]) providerMap[prov] = 0;
      providerMap[prov]++;
    });

    const providers = Object.keys(providerMap).map(name => ({
      name,
      game_count: providerMap[name],
      actual_game_count: providerMap[name],
    }));

    // Sort by game count descending
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
    const result = await slotopolService.getGameInfo(gameId);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    // Fetch local metadata
    const meta = await GameMetadata.findOne({ gameId });

    const game = {
      ...result,
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
// GAME SESSION ENDPOINTS – Use Slotopol
// ============================================================

exports.startGame = async (req, res) => {
  try {
    const { gameId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Parse gameId (e.g., "novomatic/bookofra")
    const parts = gameId.split('/');
    if (parts.length < 2) {
      return res.status(400).json({ success: false, error: 'Invalid game ID format' });
    }
    const provider = parts[0];
    const game = parts.slice(1).join('/');

    // Start session with Slotopol
    const sessionData = await slotopolService.startGame(
      userId,
      provider,
      game,
      betAmount || 1,
      selectedLines || 20
    );

    // Create local session record
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

    // Find session
    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Perform spin
    const spinResult = await slotopolService.spin(
      session.slotopol_game_id,
      betAmount || session.bet_amount,
      selectedLines || session.selected_lines
    );

    // Update session state
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

    // Find session
    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Collect win
    const result = await slotopolService.collect(session.slotopol_game_id);

    // Update session state
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
