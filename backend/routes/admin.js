const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminExtras = require('../controllers/adminExtras');
const permanentUserController = require('../controllers/permanentUserController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

// Keep the main controller intact while supplying handlers that were missing from
// older versions of adminController.js.
Object.assign(adminController, adminExtras);

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/users/:id/permanent', permanentUserController.deleteUserPermanently);
router.post('/users/:id/balance', adminController.adjustUserBalance);

router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/approve', adminController.approveTransaction);
router.put('/transactions/:id/reject', adminController.rejectTransaction);

router.get('/games', adminController.getGames);
router.get('/games/:id', adminController.getGameById);
router.post('/games', adminController.createGame);
router.put('/games/:id', adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);

router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

router.get('/promotions', adminController.getPromotions);
router.post('/promotions', adminController.createPromotion);
router.put('/promotions/:id', adminController.updatePromotion);
router.delete('/promotions/:id', adminController.deletePromotion);

router.get('/languages', adminController.getLanguages);
router.put('/languages/:code', adminController.updateLanguage);

router.get('/settings/:category', adminController.getSettings);
router.put('/settings/:category', adminController.updateSettings);

router.get('/support/messages', adminController.getSupportMessages);
router.post('/support/reply', adminController.sendSupportReply);
router.put('/support/resolve/:id', adminController.resolveSupportTicket);

router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
