const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/approve', adminController.approveTransaction);
router.put('/transactions/:id/reject', adminController.rejectTransaction);
router.put('/games/:id/rtp', adminController.adjustGameRTP);
router.put('/games/:id/win-rate', adminController.adjustWinRate);
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;
