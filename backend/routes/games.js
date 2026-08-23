const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const clubGameController = require('../controllers/clubGameController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

router.get('/', optionalAuthenticate, gameController.getAllGames);
// Club-scoped catalogue. Authentication is optional so the frontend can load
// without crashing before login; the controller resolves the configured club
// when no player token is present.
router.get('/available', optionalAuthenticate, clubGameController.getAvailableGames);
router.get('/providers', optionalAuthenticate, gameController.getAllProviders);
router.get('/:id', optionalAuthenticate, gameController.getGameById);
router.post('/start', authenticate, gameController.startGame);
router.post('/spin', authenticate, gameController.spin);
router.post('/collect', authenticate, gameController.collectWin);

module.exports = router;
