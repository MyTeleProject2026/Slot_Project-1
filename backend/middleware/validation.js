const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  };
};

const normalizeMyanmarPhone = (value) => String(value || '').trim().replace(/[\s()-]/g, '');

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .custom(value => /^(?:\+?95|0)?9\d{7,9}$/.test(normalizeMyanmarPhone(value)))
    .withMessage('Please provide a valid Myanmar phone number'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const loginValidation = [
  body().custom((value, { req }) => {
    if (!String(req.body.identifier ?? req.body.username ?? '').trim()) {
      throw new Error('Phone number or username is required');
    }
    return true;
  }),
  body('password').notEmpty().withMessage('Password is required')
];

const depositValidation = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(['bank_transfer', 'crypto', 'e_wallet']).withMessage('Invalid payment method'),
  body('bankAccountId').optional().isInt().withMessage('Invalid bank account')
];

const withdrawValidation = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('bankAccountId').notEmpty().withMessage('Bank account is required').isInt().withMessage('Invalid bank account')
];

module.exports = { validate, registerValidation, loginValidation, depositValidation, withdrawValidation };