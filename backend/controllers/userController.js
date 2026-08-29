const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const phone = String(req.body.phone || '').trim().replace(/[\s()-]/g, '');
    if (!fullName) return res.status(400).json({ success: false, error: 'Full name is required' });
    if (!phone) return res.status(400).json({ success: false, error: 'Phone number is required' });
    if (!/^(?:\+?95|0)?9\d{7,9}$/.test(phone)) return res.status(400).json({ success: false, error: 'Invalid Myanmar phone number' });
    const existing = await User.findByPhone(phone);
    if (existing && Number(existing.id) !== Number(req.userId)) return res.status(409).json({ success: false, error: 'Phone number already registered' });
    const updated = await User.update(req.userId, { full_name: fullName, phone });
    if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
    const user = await User.findById(req.userId);
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, error: 'Old password incorrect' });
    const password = String(newPassword || '');
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ success: false, error: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number' });
    const hashed = await bcrypt.hash(password, 12);
    await User.update(req.userId, { password: hashed });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};
