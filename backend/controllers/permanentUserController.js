const User = require('../models/User');
const AdminActivityLog = require('../models/AdminActivityLog');

exports.deleteUserPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body || {};
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (['super_admin', 'main_admin', 'admin', 'employee'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Use administrator management to remove admin accounts' });
    }

    await User.permanentlyDelete(id);
    try {
      await AdminActivityLog.create({
        adminId: req.userId,
        action: 'PERMANENT_DELETE_USER',
        targetType: 'user',
        targetId: id,
        description: `User permanently deleted${reason ? `: ${reason}` : ''}`
      });
    } catch (logError) {
      console.error('Permanent deletion audit log error:', logError);
    }

    res.json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    console.error('Permanent delete user error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to permanently delete user' });
  }
};
