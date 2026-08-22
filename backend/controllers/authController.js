const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateToken, generateRefreshToken } = require('../config/auth');
const { ROLES } = require('../config/roles');
const pool = require('../config/database'); // For raw SQL updates
const slotopolService = require('../services/slotopolService'); // NEW

// ============================================================
// Environment-based Admin Authentication (Keep existing)
// ============================================================

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

  const admin = virtualAdmins.find(a => a.id === userId);
  if (admin && admin.username) {
    return {
      id: admin.id,
      username: admin.username,
      email: `${admin.username}@admin.local`,
      fullName: admin.role.replace('_', ' ').toUpperCase(),
      role: admin.role,
      status: 'active',
      isVirtual: true,
    };
  }
  return null;
}

// ============================================================
// Registration (UPDATED to mirror user to Slotopol)
// ============================================================

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ success: false, error: 'Username taken' });
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(400).json({ success: false, error: 'Email registered' });
    
    const hashed = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashed, fullName, phone });
    await Wallet.create(userId);

    // N999Bet is authoritative for customer identity and wallet state.
    // Do not create or synchronize a per-customer Slotopol account here.
    const slotopolUid = null;


    const user = await User.findById(userId);
    const token = generateToken(userId, ROLES.USER);
    const refreshToken = generateRefreshToken(userId);
    
    res.status(201).json({ 
      success: true, 
      token, 
      refreshToken, 
      user: { ...user, slotopol_uid: slotopolUid } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

// ============================================================
// Login (Keep as is)
// ============================================================

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = getAdminFromEnv(username, password);
    if (adminUser) {
      const token = generateToken(adminUser.id, adminUser.role);
      const refreshToken = generateRefreshToken(adminUser.id);
      const { password: _, ...userInfo } = adminUser;
      return res.json({
        success: true,
        token,
        refreshToken,
        user: userInfo,
        wallet: { main_balance: 0, bonus_balance: 0, commission_balance: 0 },
      });
    }

    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ success: false, error: 'Account inactive' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    await User.updateLastLogin(user.id, req.ip);
    const wallet = await Wallet.findByUserId(user.id);
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    res.json({ success: true, token, refreshToken, user, wallet });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// ============================================================
// Refresh Token & Get Me (Keep as is, they already handle virtual admins)
// ============================================================

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
    const decoded = require('../config/auth').verifyToken(refreshToken);
    if (!decoded) return res.status(401).json({ success: false, error: 'Invalid refresh token' });

    const virtualAdmin = getVirtualAdminById(decoded.userId);
    if (virtualAdmin) {
      const token = generateToken(virtualAdmin.id, virtualAdmin.role);
      const newRefresh = generateRefreshToken(virtualAdmin.id);
      return res.json({
        success: true,
        token,
        refreshToken: newRefresh,
        user: virtualAdmin,
        wallet: { main_balance: 0, bonus_balance: 0, commission_balance: 0 },
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const token = generateToken(user.id, user.role);
    const newRefresh = generateRefreshToken(user.id);
    res.json({ success: true, token, refreshToken: newRefresh });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, error: 'Refresh failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const virtualAdmin = getVirtualAdminById(req.userId);
    if (virtualAdmin) {
      return res.json({
        success: true,
        user: virtualAdmin,
        wallet: { main_balance: 0, bonus_balance: 0, commission_balance: 0 },
      });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const wallet = await Wallet.findByUserId(req.userId);
    res.json({ success: true, user, wallet });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user data' });
  }
};
