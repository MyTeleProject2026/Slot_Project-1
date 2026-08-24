const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameCapabilitiesController');
const { optionalAuthenticate } = require('../middleware/auth');

router.get('/:id', optionalAuthenticate, controller.getCapabilities);

module.exports = router;
