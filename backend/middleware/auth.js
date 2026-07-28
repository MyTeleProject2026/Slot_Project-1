const { verifyToken } = require('../config/auth');
const pool = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                code: 'AUTH_001'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'AUTH_002'
            });
        }

        const [users] = await pool.query(
            'SELECT id, username, email, role, status FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                code: 'AUTH_003'
            });
        }

        const user = users[0];
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Account is not active',
                code: 'AUTH_004'
            });
        }

        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            code: 'AUTH_500'
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                code: 'AUTH_401'
            });
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                code: 'AUTH_403'
            });
        }
    };
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        const { role } = req.user;
        const { hasPermission } = require('../config/roles');
        
        if (hasPermission(role, permission)) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                error: `Missing permission: ${permission}`,
                code: 'AUTH_403'
            });
        }
    };
};

module.exports = {
    authenticate,
    authorize,
    requirePermission
};