const { verifyToken } = require('../config/auth');
const pool = require('../config/database');
const { hasPermission } = require('../config/roles');

function getVirtualAdminById(userId) {
  const virtualAdmins = [
    { id: 99991, role: 'super_admin', username: process.env.SUPER_ADMIN_USERNAME },
    { id: 99992, role: 'main_admin', username: process.env.MAIN_ADMIN_USERNAME },
    { id: 99993, role: 'admin', username: process.env.ADMIN_USERNAME },
    { id: 99994, role: 'employee', username: process.env.EMPLOYEE_USERNAME },
  ];
  const admin = virtualAdmins.find(a => a.id === userId);
  if (!admin || !admin.username) return null;
  return { id: admin.id, username: admin.username, email: `${admin.username}@admin.local`, fullName: admin.role.replace('_', ' ').toUpperCase(), role: admin.role, status: 'active', isVirtual: true, club_id: Number(process.env.N999BET_DEFAULT_CLUB_ID || 1) };
}

async function loadUser(userId) {
  const [users] = await pool.query('SELECT id, username, email, role, status, COALESCE(club_id, 1) AS club_id FROM users WHERE id = ?', [userId])
    .catch(async () => pool.query('SELECT id, username, email, role, status FROM users WHERE id = ?', [userId]));
  return users[0] || null;
}

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token provided', code: 'AUTH_001' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, error: 'Invalid or expired token', code: 'AUTH_002' });
    const virtualAdmin = getVirtualAdminById(decoded.userId);
    const user = virtualAdmin || await loadUser(decoded.userId);
    if (!user) return res.status(401).json({ success: false, error: 'User not found', code: 'AUTH_003' });
    if (user.status !== 'active') return res.status(403).json({ success: false, error: 'Account is not active', code: 'AUTH_004' });
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed', code: 'AUTH_500' });
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    const decoded = verifyToken(token);
    if (!decoded) return next();
    const virtualAdmin = getVirtualAdminById(decoded.userId);
    const user = virtualAdmin || await loadUser(decoded.userId);
    if (!user || user.status !== 'active') return next();
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.warn('Optional authentication ignored:', error.message);
    next();
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized', code: 'AUTH_401' });
  if (allowedRoles.includes(req.user.role)) return next();
  return res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'AUTH_403' });
};

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized', code: 'AUTH_401' });
  if (hasPermission(req.user.role, permission)) return next();
  return res.status(403).json({ success: false, error: `Missing permission: ${permission}`, code: 'AUTH_403' });
};

module.exports = { authenticate, optionalAuthenticate, authorize, requirePermission };
