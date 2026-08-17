const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

// 🔍 DEBUG: Log the controller to verify it's loaded
console.log('🔍 adminController methods:', Object.keys(adminController));

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Transaction management
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/approve', adminController.approveTransaction);
router.put('/transactions/:id/reject', adminController.rejectTransaction);

// Game control
router.put('/games/:id/rtp', adminController.adjustGameRTP);
router.put('/games/:id/win-rate', adminController.adjustWinRate);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
