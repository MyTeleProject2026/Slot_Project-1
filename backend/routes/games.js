const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const gameCapabilitiesController = require('../controllers/gameCapabilitiesController');
const clubGameController = require('../controllers/clubGameController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

router.get('/', optionalAuthenticate, gameController.getAllGames);
router.get('/available', optionalAuthenticate, clubGameController.getAvailableGames);
router.get('/providers', optionalAuthenticate, gameController.getAllProviders);
router.get('/capabilities/:id', optionalAuthenticate, gameCapabilitiesController.getCapabilities);
router.get('/:id', optionalAuthenticate, gameController.getGameById);
router.post('/start', authenticate, gameController.startGame);
router.post('/spin', authenticate, gameController.spin);
router.post('/collect', authenticate, gameController.collectWin);
router.post('/doubleup', authenticate, gameController.doubleUp);
router.post('/lines', authenticate, gameController.setLines);

module.exports = router;
