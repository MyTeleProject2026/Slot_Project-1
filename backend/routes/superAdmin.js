const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

router.get('/admins', superAdminController.getAdmins);
router.post('/admins', superAdminController.createAdmin);
router.put('/admins/:id', superAdminController.updateAdmin);
router.delete('/admins/:id', superAdminController.deleteAdmin);
router.get('/balance', superAdminController.getAdminBalance);
router.post('/balance/add', superAdminController.addBalanceToAdmin);
router.post('/balance/transfer', superAdminController.transferBalance);
router.get('/settings', superAdminController.getSettings);
router.put('/settings', superAdminController.updateSettings);
router.put('/games/settings', superAdminController.updateGameSettings);
router.put('/payments/settings', superAdminController.updatePaymentSettings);

module.exports = router;
