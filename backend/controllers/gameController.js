const GameSession = require('../models/GameSession');
const GameMetadata = require('../models/GameMetadata');
const slotopolService = require('../services/slotopolService');
const pool = require('../config/database');
const Wallet = require('../models/Wallet');

function extractGameInfo(game) {
  const aliases = Array.isArray(game.aliases) ? game.aliases : [];
  const alias = aliases[0] || null;
  const rawId = game.game_id || game.id || game.ID || (alias && alias.prov && alias.name ? `${alias.prov}/${alias.name}` : '');
  const rawProvider = game.prov || game.provider || alias?.prov || (rawId.includes('/') ? rawId.split('/')[0] : '');
  const rawName = game.name || alias?.name || (rawId.includes('/') ? rawId.split('/').slice(1).join('/') : rawId) || 'Unknown Game';
  return { id: String(rawId || 'unknown'), name: String(rawName), provider: String(rawProvider || 'unknown'), gameType: Number(game.gt ?? game.gameType ?? 1), enabled: game.enabled !== false && game.active !== false && game.status !== 'disabled', raw: game };
}

function getGameCategory(provider, gameType) {
  const typeMap = { 1: 'slots', 2: 'table', 3: 'cards', 4: 'roulette', 5: 'jackpot', 6: 'other' };
  if (typeMap[Number(gameType)]) return typeMap[Number(gameType)];
  const map = { agt: 'slots', aristocrat: 'slots', betsoft: 'slots', 'ct interactive': 'slots', igt: 'slots', megajack: 'slots', netent: 'slots', novomatic: 'slots', playngo: 'slots', playtech: 'slots', slotopol: 'slots' };
  return map[String(provider || '').toLowerCase()] || 'slots';
}

function normalizeGame(game) {
  const info = extractGameInfo(game);
  const raw = info.raw || {};
  return {
    id: info.id, gameId: info.id, name: info.name, provider: info.provider,
    image: raw.image || raw.image_url || '', isActive: info.enabled, enabled: info.enabled,
    minBet: 0.1, maxBet: 100, rtpOverride: null, difficulty: 'medium', order: 0, tags: [],
    category: getGameCategory(info.provider, info.gameType), gameType: info.gameType,
    reels: Number(raw.sx || 0), rows: Number(raw.sy || 0), lines: Number(raw.ln || raw.lnum || 0),
    symbolCount: Number(raw.sn || 0), rtp: Array.isArray(raw.rtp) ? raw.rtp : (raw.rtp == null ? [] : [raw.rtp]),
    aliases: Array.isArray(raw.aliases) ? raw.aliases : [], raw,
  };
}

function applyMetadata(game, meta = {}) {
  return { ...game, image: meta.image || game.image || '', isActive: game.enabled && meta.isActive !== false,
    minBet: meta.minBet ?? game.minBet, maxBet: meta.maxBet ?? game.maxBet, rtpOverride: meta.rtpOverride ?? null,
    difficulty: meta.difficulty || 'medium', order: meta.order ?? 0, tags: meta.tags || [] };
}

exports.getAllGames = async (req, res) => {
  try {
    const { provider, category, search, hot, new: isNew } = req.query;
    const games = await slotopolService.getGameList();
    const metadata = await GameMetadata.find();
    const metaMap = {}; metadata.forEach((m) => { metaMap[m.gameId] = m; });
    let filtered = games.map((source) => applyMetadata(normalizeGame(source), metaMap[extractGameInfo(source).id]));
    if (provider) filtered = filtered.filter((g) => g.provider.toLowerCase() === String(provider).toLowerCase());
    if (category && category !== 'all' && category !== 'undefined') filtered = filtered.filter((g) => g.category === String(category).toLowerCase());
    if (search && String(search).trim()) { const s = String(search).toLowerCase().trim(); filtered = filtered.filter((g) => g.name.toLowerCase().includes(s) || g.id.toLowerCase().includes(s)); }
    if (hot === 'true' || isNew === 'true') filtered = filtered.slice(0, 50);
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, games: filtered });
  } catch (error) { console.error('Get games error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch games' }); }
};

exports.getAllProviders = async (req, res) => {
  try {
    const games = await slotopolService.getGameList(); const providerMap = {};
    games.forEach((game) => { const info = extractGameInfo(game); providerMap[info.provider] = (providerMap[info.provider] || 0) + 1; });
    const providers = Object.keys(providerMap).map((name) => ({ name, game_count: providerMap[name], actual_game_count: providerMap[name] })).sort((a, b) => b.game_count - a.game_count);
    res.json({ success: true, providers });
  } catch (error) { console.error('Get providers error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch providers' }); }
};

exports.getGameById = async (req, res) => {
  try {
    const gameId = decodeURIComponent(req.params.id); const games = await slotopolService.getGameList();
    const source = games.find((game) => extractGameInfo(game).id === gameId);
    if (!source) return res.status(404).json({ success: false, error: 'Game not found' });
    const game = normalizeGame(source); const meta = await GameMetadata.findOne({ gameId });
    res.json({ success: true, game: applyMetadata(game, meta || {}) });
  } catch (error) { console.error('Get game by id error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch game' }); }
};

exports.startGame = async (req, res) => {
  try {
    const { gameId, betAmount, selectedLines } = req.body;
    const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (typeof gameId !== 'string' || !gameId.includes('/')) return res.status(400).json({ success: false, error: 'Invalid game ID' });
    let userRows;
    try { [userRows] = await pool.query('SELECT id, username, phone, status, club_id FROM users WHERE id = ?', [userId]); }
    catch { [userRows] = await pool.query('SELECT id, username, phone, status FROM users WHERE id = ?', [userId]); userRows = userRows.map((row) => ({ ...row, club_id: 1 })); }
    if (!userRows.length) return res.status(404).json({ success: false, error: 'User not found' });
    if (userRows[0].status && userRows[0].status !== 'active') return res.status(403).json({ success: false, error: 'User account is not active' });
    const clubId = Number(userRows[0].club_id || process.env.N999BET_SLOTOPOL_CLUB_ID || 1);
    const requestedBet = Number(betAmount || 1); const requestedLines = Number(selectedLines || 20);
    if (!Number.isFinite(requestedBet) || requestedBet <= 0) return res.status(400).json({ success: false, error: 'Invalid bet amount' });
    const wallet = await Wallet.findByUserId(userId);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    if (Number(wallet.main_balance) < requestedBet) return res.status(409).json({ success: false, error: 'Insufficient balance' });
    const [provider, ...gameParts] = gameId.split('/'); const game = gameParts.join('/');
    if (!provider || !game) return res.status(400).json({ success: false, error: 'Invalid game ID' });
    const playerPhone = String(userRows[0].phone || '').trim();
    if (!playerPhone) return res.status(422).json({ success: false, error: 'Player phone number is required before playing Slotopol games', code: 'PLAYER_PHONE_REQUIRED' });
    const playerName = userRows[0].username || `N999Bet-${userId}`;
    const slotopolUid = await slotopolService.ensurePlayerUid(userId, clubId, playerPhone, playerName);
    const sessionData = await slotopolService.startGame(clubId, provider, game, slotopolUid);
    const sessionId = await GameSession.create({ userId, clubId, slotopolGameId: sessionData.gid, gameAlias: `${provider}/${game}`, providerName: provider, gameName: game, betAmount: requestedBet, selectedLines: requestedLines, state: { provider: sessionData, slotopolUid, slotopolPhone: playerPhone, pendingGain: 0, lastBet: requestedBet, settledBet: false, settledGain: false } });
    res.json({ success: true, sessionId, session: sessionData, slotopolUid, slotopolPhone: playerPhone, wallet: Number(wallet.main_balance) });
  } catch (error) { console.error('Start game error:', error); res.status(error.status === 403 ? 403 : (error.status || 502)).json({ success: false, error: error.message || 'Failed to start game', code: error.code || 'GAME_START_FAILED' }); }
};

exports.spin = async (req, res) => {
  try {
    const { sessionId, betAmount, selectedLines } = req.body; const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const session = await GameSession.findById(sessionId);
    if (!session || Number(session.user_id) !== Number(userId)) return res.status(404).json({ success: false, error: 'Session not found' });
    const bet = Number(betAmount || session.bet_amount);
    if (!Number.isFinite(bet) || bet <= 0) return res.status(400).json({ success: false, error: 'Invalid bet amount' });
    const wallet = await Wallet.findByUserId(userId);
    if (!wallet || Number(wallet.main_balance) < bet) return res.status(409).json({ success: false, error: 'Insufficient balance' });
    const spinResult = await slotopolService.spin(session.slotopol_game_id, bet, Number(selectedLines || session.selected_lines));
    const gain = Number(spinResult?.gain ?? spinResult?.game?.gain ?? spinResult?.result?.gain ?? 0);
    const [debit] = await pool.query('UPDATE wallets SET main_balance = main_balance - ? WHERE user_id = ? AND main_balance >= ?', [bet, userId, bet]);
    if (!debit.affectedRows) return res.status(409).json({ success: false, error: 'Insufficient balance' });
    const updatedWallet = await Wallet.findByUserId(userId);
    await GameSession.updateState(sessionId, { provider: spinResult, pendingGain: Math.max(0, gain), lastBet: bet, settledBet: true, settledGain: false });
    res.json({ success: true, result: { ...spinResult, gain }, wallet: Number(updatedWallet.main_balance) });
  } catch (error) { console.error('Spin error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Spin failed' }); }
};

exports.collectWin = async (req, res) => {
  try {
    const { sessionId } = req.body; const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const session = await GameSession.findById(sessionId);
    if (!session || Number(session.user_id) !== Number(userId)) return res.status(404).json({ success: false, error: 'Session not found' });
    const state = typeof session.state === 'string' ? JSON.parse(session.state || '{}') : (session.state || {});
    const pendingGain = Number(state.pendingGain || 0); const result = await slotopolService.collect(session.slotopol_game_id);
    if (pendingGain > 0 && !state.settledGain) {
      await Wallet.updateBalance(userId, 'main', pendingGain);
      state.settledGain = true; state.pendingGain = 0; state.providerCollect = result;
      await GameSession.updateState(sessionId, state); await GameSession.complete(sessionId);
      const wallet = await Wallet.findByUserId(userId);
      return res.json({ success: true, wallet: Number(wallet.main_balance), gain: pendingGain });
    }
    await GameSession.complete(sessionId);
    res.json({ success: true, wallet: Number((await Wallet.findByUserId(userId)).main_balance), gain: 0 });
  } catch (error) { console.error('Collect win error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Collect failed' }); }
};

exports.doubleUp = async (req, res) => {
  try {
    const { sessionId, multiplier } = req.body; const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const session = await GameSession.findById(sessionId);
    if (!session || Number(session.user_id) !== Number(userId)) return res.status(404).json({ success: false, error: 'Session not found' });
    const mult = Number(multiplier);
    if (![2, 4, 8].includes(mult)) return res.status(400).json({ success: false, error: 'Unsupported double-up multiplier' });
    const state = typeof session.state === 'string' ? JSON.parse(session.state || '{}') : (session.state || {});
    const pendingGain = Number(state.pendingGain || 0);
    if (pendingGain <= 0 || state.settledGain) return res.status(409).json({ success: false, error: 'No pending gain available for double-up' });
    const result = await slotopolService.doubleUp(session.slotopol_game_id, mult);
    const gain = Number(result?.gain ?? result?.game?.gain ?? result?.result?.gain ?? 0);
    state.pendingGain = Math.max(0, gain); state.providerDoubleUp = result;
    await GameSession.updateState(sessionId, state);
    res.json({ success: true, result, gain, wallet: Number((await Wallet.findByUserId(userId)).main_balance) });
  } catch (error) { console.error('Double-up error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Double-up failed' }); }
};

exports.setLines = async (req, res) => {
  try {
    const { sessionId, selectedLines } = req.body; const userId = req.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const session = await GameSession.findById(sessionId);
    if (!session || Number(session.user_id) !== Number(userId)) return res.status(404).json({ success: false, error: 'Session not found' });
    const lines = Number(selectedLines);
    if (!Number.isInteger(lines) || lines <= 0) return res.status(400).json({ success: false, error: 'Invalid line count' });
    const result = await slotopolService.setLines(session.slotopol_game_id, lines);
    await pool.query('UPDATE game_sessions SET selected_lines = ?, updated_at = NOW() WHERE id = ?', [lines, sessionId]);
    res.json({ success: true, result, selectedLines: lines });
  } catch (error) { console.error('Set lines error:', error); res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to set lines' }); }
};
