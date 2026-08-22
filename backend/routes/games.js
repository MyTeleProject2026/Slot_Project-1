const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');

router.get('/', gameController.getAllGames);
router.get('/providers', gameController.getAllProviders);
router.get('/:id', gameController.getGameById);
router.post('/start', authenticate, gameController.startGame);
router.post('/spin', authenticate, gameController.spin);
router.post('/collect', authenticate, gameController.collectWin);

module.exports = router;
