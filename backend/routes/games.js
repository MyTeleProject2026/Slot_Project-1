const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const clubGameController = require('../controllers/clubGameController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

// Public catalogue for compatibility; when a token is supplied the
// optional middleware exposes the player's club to the controller.
router.get('/', optionalAuthenticate, gameController.getAllGames);
// Authoritative club-scoped catalogue used by the player application.
router.get('/available', authenticate, clubGameController.getAvailableGames);
router.get('/providers', optionalAuthenticate, gameController.getAllProviders);
router.get('/:id', optionalAuthenticate, gameController.getGameById);
router.post('/start', authenticate, gameController.startGame);
router.post('/spin', authenticate, gameController.spin);
router.post('/collect', authenticate, gameController.collectWin);

module.exports = router;
