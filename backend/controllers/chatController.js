const ChatMessage = require('../models/ChatMessage');

exports.getUserMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.getByUser(req.userId);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, category = 'general' } = req.body;
    // ✅ Added validation
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const id = await ChatMessage.create({ 
      userId: req.userId, 
      message, 
      isFromUser: true, 
      category 
    });
    const msg = await ChatMessage.findById(id);
    res.status(201).json({ success: true, message: msg });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await ChatMessage.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
};

exports.getPendingMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.getPending();
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get pending messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending messages' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.getConversation(userId, req.userId);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to get conversation' });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    // ✅ Added validation
    if (!userId || !message) {
      return res.status(400).json({ success: false, error: 'User ID and message are required' });
    }
    const id = await ChatMessage.create({ 
      userId, 
      adminId: req.userId, 
      message, 
      isFromUser: false 
    });
    const msg = await ChatMessage.findById(id);
    res.json({ success: true, message: msg });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send reply' });
  }
};

exports.resolveMessage = async (req, res) => {
  try {
    await ChatMessage.updateStatus(req.params.id, 'resolved');
    res.json({ success: true });
  } catch (error) {
    console.error('Resolve message error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve message' });
  }
};
