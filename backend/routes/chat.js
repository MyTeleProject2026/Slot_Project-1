const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/roles');

router.get('/messages', authenticate, chatController.getUserMessages);
router.post('/send', authenticate, chatController.sendMessage);
router.put('/read/:id', authenticate, chatController.markAsRead);

// Admin routes
router.use('/admin', authenticate);
router.use('/admin', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN));
router.get('/admin/pending', chatController.getPendingMessages);
router.get('/admin/conversations/:userId', chatController.getConversation);
router.post('/admin/reply', chatController.replyMessage);
router.put('/admin/resolve/:id', chatController.resolveMessage);

module.exports = router;
