const express = require('express');
const router = express.Router();
const mainAdminController = require('../controllers/mainAdminController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.use(authenticate);
router.use(authorize(ROLES.MAIN_ADMIN));

router.get('/super-admins', mainAdminController.getSuperAdmins);
router.post('/super-admins', mainAdminController.createSuperAdmin);
router.put('/super-admins/:id', mainAdminController.updateSuperAdmin);
router.delete('/super-admins/:id', mainAdminController.deleteSuperAdmin);
router.get('/all-admins', mainAdminController.getAllAdmins);
router.put('/admins/:id/status', mainAdminController.updateAdminStatus);
router.post('/balance/add-to-super-admin', mainAdminController.addBalanceToSuperAdmin);
router.post('/balance/add-to-admin', mainAdminController.addBalanceToAdmin);
router.get('/balance/overview', mainAdminController.getBalanceOverview);
router.get('/audit/logs', mainAdminController.getAuditLogs);
router.get('/audit/admins', mainAdminController.getAdminAudit);
router.get('/audit/transactions', mainAdminController.getTransactionAudit);
router.get('/stats/full', mainAdminController.getFullStats);

module.exports = router;
