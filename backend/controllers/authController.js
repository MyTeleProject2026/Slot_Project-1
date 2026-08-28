const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const AdminBalance = require('../models/AdminBalance');
const { generateToken, generateRefreshToken } = require('../config/auth');
const { ROLES } = require('../config/roles');

function firstEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function adminEnvironmentConfig() {
  return [
    {
      username: ['SUPER_ADMIN_USERNAME', 'SUPERADMIN_USERNAME', 'N999BET_SUPER_ADMIN_USERNAME', 'N999BET_SUPERADMIN_USERNAME', 'N999BET_SUPER_ADMIN_USER'],
      password: ['SUPER_ADMIN_PASSWORD', 'SUPERADMIN_PASSWORD', 'N999BET_SUPER_ADMIN_PASSWORD', 'N999BET_SUPERADMIN_PASSWORD', 'N999BET_SUPER_ADMIN_PASS'],
      role: ROLES.SUPER_ADMIN,
      id: 99991,
    },
    {
      username: ['MAIN_ADMIN_USERNAME', 'MAINADMIN_USERNAME', 'N999BET_MAIN_ADMIN_USERNAME'],
      password: ['MAIN_ADMIN_PASSWORD', 'MAINADMIN_PASSWORD', 'N999BET_MAIN_ADMIN_PASSWORD'],
      role: ROLES.MAIN_ADMIN,
      id: 99992,
    },
    {
      username: ['ADMIN_USERNAME', 'N999BET_ADMIN_USERNAME'],
      password: ['ADMIN_PASSWORD', 'N999BET_ADMIN_PASSWORD'],
      role: ROLES.ADMIN,
      id: 99993,
    },
    {
      username: ['EMPLOYEE_USERNAME', 'N999BET_EMPLOYEE_USERNAME'],
      password: ['EMPLOYEE_PASSWORD', 'N999BET_EMPLOYEE_PASSWORD'],
      role: ROLES.EMPLOYEE,
      id: 99994,
    },
  ];
}

function getAdminFromEnv(username, password) {
  const normalizedUsername = String(username || '').trim().toLowerCase();
  const suppliedPassword = String(password ?? '');
  for (const config of adminEnvironmentConfig()) {
    const envUser = firstEnv(config.username);
    const envPass = firstEnv(config.password);
    if (!envUser || !envPass || envUser.toLowerCase() !== normalizedUsername) continue;
    const passwordMatches = envPass.startsWith('$2a$') || envPass.startsWith('$2b$') || envPass.startsWith('$2y$')
      ? bcrypt.compareSync(suppliedPassword, envPass)
      : suppliedPassword === envPass;
    if (!passwordMatches) return null;
    return {
      id: config.id,
      username: envUser,
      email: `${envUser}@admin.local`,
      fullName: config.role.replace('_', ' ').toUpperCase(),
      role: config.role,
      status: 'active',
      isVirtual: true,
    };
  }
  return null;
}

function getVirtualAdminById(userId) {
  const configs = adminEnvironmentConfig();
  const config = configs.find(item => item.id === Number(userId));
  const username = config ? firstEnv(config.username) : '';
  if (!config || !username) return null;
  return {
    id: config.id,
    username,
    email: `${username}@admin.local`,
    fullName: config.role.replace('_', ' ').toUpperCase(),
    role: config.role,
    status: 'active',
    isVirtual: true,
  };
}

async function getAdminWallet(admin) {
  const balance = await AdminBalance.findByAdminId(admin.id);
  return {
    main_balance: balance ? Number(balance.balance) : 0,
    frozen_balance: balance ? Number(balance.frozen_balance) : 0,
    bonus_balance: 0,
    commission_balance: 0,
    currency: 'MMK',
    countryCode: 'MM',
  };
}

function normalizePhone(phone) {
  return String(phone || '').trim().replace(/[\s()-]/g, '');
}

exports.register = async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ success: false, error: 'Username must be 3-20 letters, numbers, or underscores' });
    }
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });
    if (!/^(?:\+?95|0)?9\d{7,9}$/.test(phone)) return res.status(400).json({ success: false, error: 'Invalid Myanmar phone number' });
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number' });
    }
    if (!confirmPassword) return res.status(400).json({ success: false, error: 'Password confirmation is required' });
    if (password !== confirmPassword) return res.status(400).json({ success: false, error: 'Passwords do not match' });

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) return res.status(400).json({ success: false, error: 'Username taken' });
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) return res.status(400).json({ success: false, error: 'Phone number already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const userId = await User.create({ username, email: null, password: hashed, fullName: username, phone });
    await Wallet.create(userId);
    const user = await User.findById(userId);
    const token = generateToken(userId, ROLES.USER);
    const refreshToken = generateRefreshToken(userId);
    res.status(201).json({ success: true, token, refreshToken, user: { ...user, email: null, slotopol_uid: null } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const identifier = String(req.body.identifier ?? req.body.username ?? '').trim();
    const { password } = req.body;
    if (!identifier) return res.status(400).json({ success: false, error: 'Phone number or username is required' });
    const adminUser = getAdminFromEnv(identifier, password);
    if (adminUser) {
      await AdminBalance.ensure(adminUser.id, adminUser.role);
      const token = generateToken(adminUser.id, adminUser.role);
      const refreshToken = generateRefreshToken(adminUser.id);
      return res.json({ success: true, token, refreshToken, user: adminUser, wallet: await getAdminWallet(adminUser) });
    }
    const normalizedPhone = normalizePhone(identifier);
    let user = await User.findByPhone(normalizedPhone);
    if (!user) user = await User.findByUsername(identifier);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid phone number or username' });
    if (user.status !== 'active') return res.status(403).json({ success: false, error: 'Account inactive' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    await User.updateLastLogin(user.id, req.ip);
    const wallet = await Wallet.findByUserId(user.id);
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    res.json({ success: true, token, refreshToken, user: { ...user, email: null }, wallet });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
    const decoded = require('../config/auth').verifyToken(refreshToken);
    if (!decoded) return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    const virtualAdmin = getVirtualAdminById(decoded.userId);
    if (virtualAdmin) {
      await AdminBalance.ensure(virtualAdmin.id, virtualAdmin.role);
      const token = generateToken(virtualAdmin.id, virtualAdmin.role);
      const newRefresh = generateRefreshToken(virtualAdmin.id);
      return res.json({ success: true, token, refreshToken: newRefresh, user: virtualAdmin, wallet: await getAdminWallet(virtualAdmin) });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const token = generateToken(user.id, user.role);
    const newRefresh = generateRefreshToken(user.id);
    res.json({ success: true, token, refreshToken: newRefresh, user: { ...user, email: null } });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, error: 'Refresh failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const virtualAdmin = getVirtualAdminById(req.userId);
    if (virtualAdmin) return res.json({ success: true, user: virtualAdmin, wallet: await getAdminWallet(virtualAdmin) });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const wallet = await Wallet.findByUserId(req.userId);
    res.json({ success: true, user: { ...user, email: null }, wallet });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user data' });
  }
};
