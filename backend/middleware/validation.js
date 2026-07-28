const { body, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    };
};

// Validation rules
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
];

const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const depositValidation = [
    body('amount')
        .isFloat({ min: 1 })
        .withMessage('Amount must be greater than 0'),
    body('paymentMethod')
        .isIn(['bank_transfer', 'crypto', 'e_wallet'])
        .withMessage('Invalid payment method'),
    body('bankAccountId')
        .optional()
        .isInt()
        .withMessage('Invalid bank account')
];

const withdrawValidation = [
    body('amount')
        .isFloat({ min: 1 })
        .withMessage('Amount must be greater than 0'),
    body('bankAccountId')
        .notEmpty()
        .withMessage('Bank account is required')
        .isInt()
        .withMessage('Invalid bank account')
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    depositValidation,
    withdrawValidation
};