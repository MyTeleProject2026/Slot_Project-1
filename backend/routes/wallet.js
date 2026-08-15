const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { validate, depositValidation, withdrawValidation } = require('../middleware/validation');

router.get('/balance', authenticate, walletController.getBalance);
router.post('/deposit', authenticate, validate(depositValidation), walletController.requestDeposit);
router.post('/withdraw', authenticate, validate(withdrawValidation), walletController.requestWithdraw);
router.get('/transactions', authenticate, walletController.getTransactions);
router.get('/banks', authenticate, walletController.getBankAccounts);
router.post('/banks', authenticate, walletController.addBankAccount);
router.put('/banks/:id', authenticate, walletController.updateBankAccount);
router.delete('/banks/:id', authenticate, walletController.deleteBankAccount);

module.exports = router;
