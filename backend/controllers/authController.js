const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateToken, generateRefreshToken } = require('../config/auth');
const { ROLES } = require('../config/roles');

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
    const user = await User.findById(userId);
    const token = generateToken(userId, ROLES.USER);
    const refreshToken = generateRefreshToken(userId);
    res.status(201).json({ success: true, token, refreshToken, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
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

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
    const decoded = require('../config/auth').verifyToken(refreshToken);
    if (!decoded) return res.status(401).json({ success: false, error: 'Invalid refresh token' });
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
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const wallet = await Wallet.findByUserId(req.userId);
    res.json({ success: true, user, wallet });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user data' });
  }
};
