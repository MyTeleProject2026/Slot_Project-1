const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.use(authenticate);
router.use(authorize(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));

router.get('/users', employeeController.getUsers);
router.get('/users/:id', employeeController.getUserDetails);
router.put('/users/:id/status', employeeController.updateUserStatus);
router.get('/transactions', employeeController.getTransactions);
router.put('/transactions/:id/approve', employeeController.approveTransaction);
router.put('/transactions/:id/reject', employeeController.rejectTransaction);
router.put('/games/:id/rtp', employeeController.adjustGameRTP);

module.exports = router;
