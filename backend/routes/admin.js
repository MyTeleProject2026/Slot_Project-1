const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

// ============================================================
// USER MANAGEMENT
// ============================================================
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/balance', adminController.adjustUserBalance);

// ============================================================
// TRANSACTION MANAGEMENT
// ============================================================
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/approve', adminController.approveTransaction);
router.put('/transactions/:id/reject', adminController.rejectTransaction);

// ============================================================
// GAME MANAGEMENT
// ============================================================
router.get('/games', adminController.getGames);
router.get('/games/:id', adminController.getGameById);
router.post('/games', adminController.createGame);
router.put('/games/:id', adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);
router.put('/games/:id/rtp', adminController.adjustGameRTP);
router.put('/games/:id/win-rate', adminController.adjustWinRate);

// ============================================================
// BANNER MANAGEMENT
// ============================================================
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// ============================================================
// PROMOTION MANAGEMENT
// ============================================================
router.get('/promotions', adminController.getPromotions);
router.post('/promotions', adminController.createPromotion);
router.put('/promotions/:id', adminController.updatePromotion);
router.delete('/promotions/:id', adminController.deletePromotion);

// ============================================================
// LANGUAGE MANAGEMENT
// ============================================================
router.get('/languages', adminController.getLanguages);
router.put('/languages/:code', adminController.updateLanguage);

// ============================================================
// SETTINGS MANAGEMENT
// ============================================================
router.get('/settings/:category', adminController.getSettings);
router.put('/settings/:category', adminController.updateSettings);

// ============================================================
// SUPPORT CHAT
// ============================================================
router.get('/support/messages', adminController.getSupportMessages);
router.post('/support/reply', adminController.sendSupportReply);
router.put('/support/resolve/:id', adminController.resolveSupportTicket);

// ============================================================
// DASHBOARD
// ============================================================
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
