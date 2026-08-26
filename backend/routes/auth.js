const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');

router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
