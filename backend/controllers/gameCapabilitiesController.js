const slotopolService = require('../services/slotopolService');

function gameIdOf(game) {
  return String(game?.game_id || game?.id || game?.ID || `${game?.prov || game?.provider || ''}/${game?.name || ''}`);
}

function capabilityProfile(game) {
  const gt = Number(game?.gt ?? game?.gameType ?? 1);
  const reels = Number(game?.sx || 0);
  const rows = Number(game?.sy || 0);
  const lines = Number(game?.ln || game?.lnum || 0);
  const symbols = Number(game?.sn || 0);

  return {
    gameType: gt,
    reels,
    rows,
    lines,
    symbolCount: symbols,
    rtpOptions: Array.isArray(game?.rtp) ? game.rtp : (game?.rtp == null ? [] : [game.rtp]),
    serverAuthoritative: true,
    operations: {
      createSession: true,
      spin: true,
      bet: true,
      collect: true,
      doubleUp: true,
      selection: true,
      mode: true,
    },
    renderer: {
      dynamicGrid: reels > 0 && rows > 0,
      provider: String(game?.prov || game?.provider || ''),
      gameId: gameIdOf(game),
    },
  };
}

exports.getCapabilities = async (req, res) => {
  try {
    const requestedId = decodeURIComponent(req.params.id || '');
    if (!requestedId) return res.status(400).json({ success: false, error: 'Game ID is required' });

    const games = await slotopolService.getGameList();
    const source = games.find((game) => gameIdOf(game) === requestedId);
    if (!source) return res.status(404).json({ success: false, error: 'Game not found' });

    res.json({
      success: true,
      game: {
        id: gameIdOf(source),
        name: String(source?.name || ''),
        provider: String(source?.prov || source?.provider || ''),
        enabled: source?.enabled !== false,
        capabilities: capabilityProfile(source),
        raw: source,
      },
    });
  } catch (error) {
    console.error('Get game capabilities error:', error);
    res.status(error.status || 502).json({ success: false, error: error.message || 'Failed to fetch Slotopol game capabilities' });
  }
};
