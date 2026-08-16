const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.get('/', promotionController.getActivePromotions);
router.get('/featured', promotionController.getFeaturedPromotions);
router.get('/:id', promotionController.getPromotionById);

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), promotionController.createPromotion);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN), promotionController.deletePromotion);

module.exports = router;
