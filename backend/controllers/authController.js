const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const AdminBalance = require('../models/AdminBalance');
const { generateToken, generateRefreshToken } = require('../config/auth');
const { ROLES } = require('../config/roles');

function getAdminFromEnv(username, password) {
  const adminConfigs = [
    { envUser: 'SUPER_ADMIN_USERNAME', envPass: 'SUPER_ADMIN_PASSWORD', role: ROLES.SUPER_ADMIN, id: 99991 },
    { envUser: 'MAIN_ADMIN_USERNAME', envPass: 'MAIN_ADMIN_PASSWORD', role: ROLES.MAIN_ADMIN, id: 99992 },
    { envUser: 'ADMIN_USERNAME', envPass: 'ADMIN_PASSWORD', role: ROLES.ADMIN, id: 99993 },
    { envUser: 'EMPLOYEE_USERNAME', envPass: 'EMPLOYEE_PASSWORD', role: ROLES.EMPLOYEE, id: 99994 },
  ];
  for (const config of adminConfigs) {
    const envUser = process.env[config.envUser];
    const envPass = process.env[config.envPass];
    if (envUser && username === envUser && password === envPass) {
      return { id: config.id, username: envUser, email: `${envUser}@admin.local`, fullName: config.role.replace('_', ' ').toUpperCase(), role: config.role, status: 'active', isVirtual: true };
    }
  }
  return null;
}

function getVirtualAdminById(userId) {
  const virtualAdmins = [
    { id: 99991, role: ROLES.SUPER_ADMIN, username: process.env.SUPER_ADMIN_USERNAME },
    { id: 99992, role: ROLES.MAIN_ADMIN, username: process.env.MAIN_ADMIN_USERNAME },
    { id: 99993, role: ROLES.ADMIN, username: process.env.ADMIN_USERNAME },
    { id: 99994, role: ROLES.EMPLOYEE, username: process.env.EMPLOYEE_USERNAME },
  ];
  const admin = virtualAdmins.find(a => a.id === Number(userId));
  if (!admin || !admin.username) return null;
  return { id: admin.id, username: admin.username, email: `${admin.username}@admin.local`, fullName: admin.role.replace('_', ' ').toUpperCase(), role: admin.role, status: 'active', isVirtual: true };
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
    const { username, password, fullName } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) return res.status(400).json({ success: false, error: 'Username taken' });
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) return res.status(400).json({ success: false, error: 'Phone number already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email: null, password: hashed, fullName, phone });
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
