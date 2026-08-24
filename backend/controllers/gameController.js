const GameSession = require('../models/GameSession');
const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');
const pool = require('../config/database');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

function extractGameInfo(game) {
  const aliases = Array.isArray(game.aliases) ? game.aliases : [];
  const alias = aliases[0] || null;
  const rawId = game.game_id || game.id || game.ID || (alias && alias.prov && alias.name ? `${alias.prov}/${alias.name}` : '');
  const rawProvider = game.prov || game.provider || alias?.prov || (rawId.includes('/') ? rawId.split('/')[0] : '');
  const rawName = game.name || alias?.name || (rawId.includes('/') ? rawId.split('/').slice(1).join('/') : rawId) || 'Unknown Game';
  return {
    id: String(rawId || 'unknown'),
    name: String(rawName),
    provider: String(rawProvider || 'unknown'),
    gameType: Number(game.gt ?? game.gameType ?? 1),
    enabled: game.enabled !== false && game.active !== false && game.status !== 'disabled',
    raw: game,
  };
}

function getGameCategory(provider, gameType) {
  const typeMap = { 1: 'slots', 2: 'table', 3: 'cards', 4: 'roulette', 5: 'jackpot', 6: 'other' };
  if (typeMap[Number(gameType)]) return typeMap[Number(gameType)];
  const map = {
    agt: 'slots', aristocrat: 'slots', betsoft: 'slots', 'ct interactive': 'slots',
    igt: 'slots', megajack: 'slots', netent: 'slots', novomatic: 'slots',
    playngo: 'slots', playtech: 'slots', slotopol: 'slots'
  };
  return map[String(provider || '').toLowerCase()] || 'slots';
}

function normalizeGame(game) {
  const info = extractGameInfo(game);
  return {
    id: info.id,
    gameId: info.id,
    name: info.name,
    provider: info.provider,
    image: '',
    isActive: info.enabled,
    enabled: info.enabled,
    minBet: 0.1,
    maxBet: 100,
    rtpOverride: null,
    difficulty: 'medium',
    order: 0,
    tags: [],
    category: getGameCategory(info.provider, info.gameType),
    gameType: info.gameType,
    rtp: Array.isArray(game.rtp) ? game.rtp : (game.rtp == null ? [] : [game.rtp]),
    aliases: Array.isArray(game.aliases) ? game.aliases : [],
    raw: game,
  };
}

exports.getAllGames = async (req, res) => {
  try {
    const { provider, category, search, hot, new: isNew } = req.query;
    const games = await slotopolService.getGameList();
    const metadata = await GameMetadata.find();
    const metaMap = {};
    metadata.forEach((m) => { metaMap[m.gameId] = m; });

    const enriched = games.map((source) => {
      const game = normalizeGame(source);
      const meta = metaMap[game.id] || {};
      return {
        ...game,
        isActive: game.enabled && meta.isActive !== false,
        minBet: meta.minBet ?? 0.1,
        maxBet: meta.maxBet ?? 100,
        rtpOverride: meta.rtpOverride ?? null,
        difficulty: meta.difficulty || 'medium',
        order: meta.order ?? 0,
        tags: meta.tags || [],
      };
    });

    let filtered = enriched;
    if (provider) {
      const p = String(provider).toLowerCase();
      filtered = filtered.filter((g) => g.provider.toLowerCase() === p);
    }
    if (category && category !== 'all' && category !== 'undefined') {
      filtered = filtered.filter((g) => g.category === String(category).toLowerCase());
    }
    if (search && String(search).trim()) {
      const s = String(search).toLowerCase().trim();
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(s));
    }
    if (hot === 'true' || isNew === 'true') filtered = filtered.slice(0, 50);
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, games: filtered });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch games' });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const games = await slotopolService.getGameList();
    const providerMap = {};
    games.forEach((game) => {
      const info = extractGameInfo(game);
      if (!providerMap[info.provider]) providerMap[info.provider] = 0;
      providerMap[info.provider]++;
    });
    const providers = Object.keys(providerMap).map((name) => ({ name, game_count: providerMap[name], actual_game_count: providerMap[name] }));
    providers.sort((a, b) => b.game_count - a.game_count);
    res.json({ success: true, providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch providers' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const gameId = decodeURIComponent(req.params.id);
    const games = await slotopolService.getGameList();
    const source = games.find((game) => extractGameInfo(game).id === gameId);
    if (!source) return res.status(404).json({ success: false, error: 'Game not found' });
    const game = normalizeGame(source);
    const meta = await GameMetadata.findOne({ gameId });
    res.json({ success: true, game: { ...game, isActive: game.enabled && meta?.isActive !== false, minBet: meta?.minBet ?? 0.1, maxBet: meta?.maxBet ?? 100, rtpOverride: meta?.rtpOverride ?? null, difficulty: meta?.difficulty || 'medium' } });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch game' });
  }
};

exports.startGame = async (req, res) => {
  try {
    const { gameId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (typeof gameId !== 'string' || !gameId.includes('/')) return res.status(400).json({ success: false, error: 'Invalid game ID' });
    const [userRows] = await pool.query('SELECT id, status, COALESCE(club_id, 1) AS club_id FROM users WHERE id = ?', [userId]).catch(async () => pool.query('SELECT id, status FROM users WHERE id = ?', [userId]).then(([rows]) => [rows.map((r) => ({ ...r, club_id: 1 }))]));
    if (!userRows.length) return res.status(404).json({ success: false, error: 'User not found' });
    if (userRows[0].status && userRows[0].status !== 'active') return res.status(403).json({ success: false, error: 'User account is not active' });
    const clubId = Number(userRows[0].club_id || process.env.N999BET_SLOTOPOL_CLUB_ID || 1);
    const requestedBet = Number(betAmount || 1);
    const requestedLines = Number(selectedLines || 20);
    if (!Number.isFinite(requestedBet) || requestedBet <= 0) return res.status(400).json({ success: false, error: 'Invalid bet amount' });
    const wallet = await Wallet.findByUserId(userId);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    if (Number(wallet.main_balance) < requestedBet) return res.status(409).json({ success: false, error: 'Insufficient balance' });
    const [provider, ...gameParts] = gameId.split('/');
    const game = gameParts.join('/');
    if (!provider || !game) return res.status(400).json({ success: false, error: 'Invalid game ID' });
    const sessionData = await slotopolService.startGame(clubId, provider, game);
    const sessionId = await GameSession.create({ userId, clubId, slotopolGameId: sessionData.gid, gameAlias: `${provider}/${game}`, providerName: provider, gameName: game, betAmount: requestedBet, selectedLines: requestedLines, state: { provider: sessionData, pendingGain: 0, lastBet: requestedBet, settledBet: false, settledGain: false } });
    res.json({ success: true, sessionId, session: sessionData, wallet: Number(wallet.main_balance) });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(error.status === 403 ? 403 : (error.status || 502)).json({ success: false, error: error.message || 'Failed to start game' });
  }
};

exports.spin = async (req, res) => {
  try {
    const { sessionId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const session = await GameSession.findById(sessionId);
    if (!session || Number(session.user_id) !== Number(userId)) return res.status(404).json({ success: false, error: 'Session not found' });
    const bet = Number(betAmount || session.bet_amount);
    if (!Number.isFinite(bet) || bet <= 0) return res.status(400).json({ success: false, error: 'Invalid bet amount' });
    const wallet = await Wallet.findByUserId(userId);
    if (!wallet || Number(wallet.main_balance) < bet) return res.status(409).json({ success: false, error: 'Insufficient balance' });
    const spinResult = await slotopolService.spin(session.slotopol_game_id, bet, Number(selectedLines || session.selected_lines));
    const gain = Number(spinResult?.gain ?? spinResult?.game?.gain ?? spinResult?.result?.gain ?? 0);
    await pool.query('UPDATE wallets SET main_balance = main_balance - ? WHERE user_id = ? AND main_balance >= ?', [bet, userId, bet]);
    const updatedWallet = await Wallet.findByUserId(userId);
    await GameSession.updateState(sessionId, { provider: spinResult, pendingGain: Math.max(0, gain), lastBet: bet, settledBet: true, settledGain: false });
    await Transaction.create({ userId, type: 'game_bet', amount: bet, beforeBalance: Number(updatedWallet.main_balance) + bet, afterBalance: Number(updatedWallet.main_balance), walletType: 'main', status: 'completed', reference: `game:${sessionId}:bet:${Date.now()}`, description: `Game bet ${session.game_alias}`, metadata: { sessionId, slotopolGameId: session.slotopol_game_id } });
    res.json({ success: true, result: { ...spinResult, gain }, wallet: Number(updatedWallet.main_balance) });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(error.status || 500).json({ success: false, error: error.message || 'Spin failed' });
  }
};

exports.collectWin = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const session = await GameSession.findById(sessionId);
    if (!session || Number(session.user_id) !== Number(userId)) return res.status(404).json({ success: false, error: 'Session not found' });
    const state = typeof session.state === 'string' ? JSON.parse(session.state || '{}') : (session.state || {});
    const pendingGain = Number(state.pendingGain || 0);
    const result = await slotopolService.collect(session.slotopol_game_id);
    if (pendingGain > 0 && !state.settledGain) {
      const beforeWallet = await Wallet.findByUserId(userId);
      await Wallet.updateBalance(userId, 'main', pendingGain);
      const afterWallet = await Wallet.findByUserId(userId);
      await Transaction.create({ userId, type: 'game_win', amount: pendingGain, beforeBalance: Number(beforeWallet.main_balance), afterBalance: Number(afterWallet.main_balance), walletType: 'main', status: 'completed', reference: `game:${sessionId}:win:${Date.now()}`, description: `Game win ${session.game_alias}`, metadata: { sessionId, slotopolGameId: session.slotopol_game_id } });
      state.settledGain = true; state.pendingGain = 0; state.providerCollect = result;
      await GameSession.updateState(sessionId, state); await GameSession.complete(sessionId);
      return res.json({ success: true, wallet: Number(afterWallet.main_balance), gain: pendingGain });
    }
    await GameSession.complete(sessionId);
    res.json({ success: true, wallet: Number((await Wallet.findByUserId(userId)).main_balance), gain: 0 });
  } catch (error) {
    console.error('Collect win error:', error);
    res.status(error.status || 500).json({ success: false, error: error.message || 'Collect failed' });
  }
};
