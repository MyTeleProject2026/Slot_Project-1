const Game = require('../models/Game');
const Provider = require('../models/Provider');
const GameSession = require('../models/GameSession');
const slotopolService = require('../services/slotopolService');

exports.getAllGames = async (req, res) => {
  try {
    const { provider, category, search, hot, new: isNew } = req.query;
    let games = [];
    if (search) games = await Game.search(search);
    else if (hot === 'true') games = await Game.getHotGames(50);
    else if (isNew === 'true') games = await Game.getNewGames(50);
    else if (provider) {
      const prov = await Provider.findByName(provider);
      if (prov) games = await Game.findByProvider(prov.id);
    } else if (category) games = await Game.findByCategory(category);
    else games = await Game.findByCategory('slots');
    res.json({ success: true, games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch games' });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.getWithGameCount();
    res.json({ success: true, providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch providers' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    res.json({ success: true, game });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch game' });
  }
};

exports.startGame = async (req, res) => {
  try {
    const { gameId, betAmount, selectedLines } = req.body;
    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    const sessionData = await slotopolService.startGame(
      req.userId, 
      game.provider_name, 
      game.name, 
      betAmount || 1, 
      selectedLines || 20
    );
    const sessionId = await GameSession.create({
      userId: req.userId,
      slotopolGameId: sessionData.gid,
      gameAlias: `${game.provider_name}/${game.name}`,
      providerName: game.provider_name,
      gameName: game.name,
      betAmount: betAmount || 1,
      selectedLines: selectedLines || 20,
      state: sessionData
    });
    res.json({ success: true, sessionId, session: sessionData });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ success: false, error: 'Failed to start game' });
  }
};

exports.spin = async (req, res) => {
  try {
    const { sessionId, betAmount, selectedLines } = req.body;
    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    const spinResult = await slotopolService.spin(
      session.slotopol_game_id,
      betAmount || session.bet_amount,
      selectedLines || session.selected_lines
    );
    await GameSession.updateState(sessionId, spinResult);
    res.json({ success: true, result: spinResult, wallet: spinResult.wallet });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ success: false, error: 'Spin failed' });
  }
};

exports.collectWin = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await GameSession.findById(sessionId);
    if (!session || session.user_id !== req.userId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    const result = await slotopolService.collect(session.slotopol_game_id);
    await GameSession.updateState(sessionId, result);
    res.json({ success: true, wallet: result.wallet });
  } catch (error) {
    console.error('Collect win error:', error);
    res.status(500).json({ success: false, error: 'Collect failed' });
  }
};
