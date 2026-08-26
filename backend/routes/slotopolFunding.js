const express = require('express');
const router = express.Router();
const controller = require('../controllers/slotopolFundingController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.post('/receive', controller.receiveFunding);
router.get('/history', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), controller.getFundingHistory);

module.exports = router;
